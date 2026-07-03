import { NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import crypto from "crypto";

/**
 * HÀM KIỂM TOÁN CHỮ KÝ SỐ CHUẨN QUANTUM (ANTI-FAKE PAYMENT)
 */
function verifyWebhookSignature(rawBody: string, incomingSignature: string, secretKey: string): boolean {
  try {
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex");

    const computedBuffer = Buffer.from(computedSignature, "hex");
    const incomingBuffer = Buffer.from(incomingSignature, "hex");

    if (computedBuffer.length !== incomingBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, incomingBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const ipAddress = request.headers.get("x-forwarded-for") || "UNKNOWN";
  
  const incomingSignature = request.headers.get("x-api-signature");
  const webhookSecret = process.env.PAYMENT_GATEWAY_SECRET;

  if (!incomingSignature || !webhookSecret) {
    return NextResponse.json({ error: "Yêu cầu bị từ chối. Thiếu cấu trúc an ninh đầu cuối." }, { status: 401 });
  }

  const isVerified = verifyWebhookSignature(rawBody, incomingSignature, webhookSecret);
  if (!isVerified) {
    await supabaseServiceRole.from("payment_logs").insert({
      event_type: "SIGNATURE_VALIDATION_FAILED",
      log_data: { rawBody, attempted_signature: incomingSignature },
      ip_address: ipAddress
    });
    return NextResponse.json({ error: "Mã ký số sai lệch. Cảnh báo hành vi giả mạo dữ liệu!" }, { status: 403 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const description = String(payload.data.description).toUpperCase();
    
    //  HIỆU CHỈNH CHÍ MẠNG: Dùng \d{8} để bắt chính xác chuỗi ngày biến động động (Ví dụ: 20260614, 20260615...)
    const orderIdMatch = description.match(/MUSH\s(MUSH-\d{8}-\d+)/);
    if (!orderIdMatch) {
      return NextResponse.json({ error: "Nội dung chuyển khoản không chứa phôi định danh phù hợp." }, { status: 400 });
    }

    const orderId = orderIdMatch[1];
    const amountReceived = Number(payload.data.amount);

    const { data: payment, error: pError } = await supabaseServiceRole
      .from("payments")
      .select("amount, status")
      .eq("order_id", orderId)
      .single();

    if (pError || !payment) {
      return NextResponse.json({ error: "Vận đơn không tồn tại trên hệ thống." }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ message: "Vận đơn này đã được quyết toán trước đó." });
    }

    if (amountReceived < payment.amount) {
      return NextResponse.json({ error: "Dòng tiền nạp vào bị thiếu hụt so với tổng giá trị đơn." }, { status: 400 });
    }

    // ATOMIC UPDATE LUỒNG LOGISTICS ĐỒNG BỘ
    await supabaseServiceRole.from("payments").update({ status: "PAID" }).eq("order_id", orderId);
    await supabaseServiceRole.from("orders").update({ status: "PROCESSING" }).eq("id", orderId);
    
    await supabaseServiceRole.from("order_tracking").insert({
      order_id: orderId,
      title: "ĐÃ KHỚP TIỀN TỰ ĐỘNG",
      description: "Hệ thống CyberMushroom đã đối soát mã chữ ký số thành công và mở khóa đơn hàng."
    });

    return NextResponse.json({ success: true, message: "Khớp lệnh tự động an toàn 100% hoàn tất." });

  } catch {
    return NextResponse.json({ error: "Mạch xử lý phân rã JSON gặp sự cố crash." }, { status: 500 });
  }
}