"use server";

import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { OrderStatusType } from "@/types/payment.types";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";

interface UpdateStatusResponse {
  success: boolean;
  error?: string;
}

export async function updateOrderStatusAdminAction(
  orderId: string, 
  newStatus: OrderStatusType, 
  accessToken: string
): Promise<UpdateStatusResponse> {
  try {
    const admin = await requireAdmin(accessToken);
    let trackingTitle = "";
    let trackingDesc = "";

    switch (newStatus) {
      case "PROCESSING":
        trackingTitle = "PHÒNG LAB ĐANG ĐÓNG GÓI";
        trackingDesc = "Mẫu vật sinh khối nấm đã được kỹ sư kiểm định lâm sàng và bọc hộp bảo ôn Quantum Secure.";
        break;
      case "SHIPPED":
        trackingTitle = "ĐÃ ĐƯỢC CHUYỂN GIAO CHO ĐƠN VỊ VẬN CHUYỂN";
        trackingDesc = "Vận đơn đã rời khỏi tổng trạm, đang di chuyển trên xe bọc lạnh chuyên dụng hướng về phòng Lab tiếp nhận.";
        break;
      case "DELIVERED":
        trackingTitle = "BÀO TỬ ĐÃ KHỚP TỌA ĐỘ";
        trackingDesc = "Kỹ sư tiếp nhận đã kiểm tra, ký biên bản nghiệm thu sinh khối thành công. Chu trình kết thúc.";
        break;
      case "CANCELLED":
        trackingTitle = "ĐƠN HÀNG BỊ HỦY BỎ";
        trackingDesc = "Hệ thống Quản trị tối cao hoặc kỹ sư phòng thí nghiệm đã kích hoạt lệnh hủy tiêu hủy phôi đơn này.";
        break;
      default:
        trackingTitle = "CẬP NHẬT BIẾN ĐỘNG VẬN ĐƠN";
        trackingDesc = `Hệ thống ghi nhận trạng thái đơn hàng dịch chuyển sang nốt: ${newStatus}`;
    }

    // 1. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG CHÍNH
    const { error: orderErr } = await supabaseServiceRole
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (orderErr) throw orderErr;

    // 2. ĐIỀU HỢP TRẠNG THÁI DÒNG TIỀN TƯƠNG ỨNG
    if (newStatus === "CANCELLED") {
      await supabaseServiceRole
        .from("payments")
        .update({ status: "FAILED" })
        .eq("order_id", orderId)
        .eq("status", "PENDING");
    }

    if (newStatus === "DELIVERED") {
      await supabaseServiceRole
        .from("payments")
        .update({ status: "PAID" })
        .eq("order_id", orderId);
    }

    // 3. CẤY NHẬT KÝ HÀNH TRÌNH ĐỘC LẬP CHUẨN GIAI ĐOẠN 3
    const { error: trackErr } = await supabaseServiceRole
      .from("order_tracking")
      .insert({
        order_id: orderId,
        title: trackingTitle,
        description: trackingDesc,
        actor_id: admin.id
      });

    if (trackErr) throw trackErr;

    revalidatePath("/admin/orders");
    return { success: true };

  } catch (err: unknown) {
    // TRÍCH XUẤT RAW TIN NHẮN TỪ ĐỐI TƯỢNG SUPABASE OBJECT KHÔNG DÙNG ANY
    let rawMessage = "SỰ CỐ CRASH MẠCH LỆNH ÂM BẢN.";
    
    if (err && typeof err === "object") {
      if ("message" in err) rawMessage = String((err as { message: unknown }).message);
      else if ("details" in err) rawMessage = String((err as { details: unknown }).details);
    } else {
      rawMessage = String(err);
    }

    return { 
      success: false, 
      error: `[Core DB Reject]: ${rawMessage}` 
    };
  }
}
