"use server";

import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { CheckoutInput, ServerActionResponse, DbProductResponse } from "@/types/payment.types";

// BỘ NHỚ ĐỆM ĐỆ TIÊN PHONG: Lưu trữ intent tạo đơn ngắn hạn cô lập tại RAM của Server-side
const requestCacheLock = new Map<string, number>();

/**
 * SERVER ACTION: KHỞI TẠO ĐƠN HÀNG VÀ SOFT-LOCK KHO SINH KHỐI
 * Đã bọc màng bảo vệ Idempotency Lượng tử chống hành vi Double-Click hoặc Script Spam.
 */
export async function createOrderAction(input: CheckoutInput, userId: string): Promise<ServerActionResponse> {
  // KHÓA BẢO VỆ ĐẦU VÀO SƠ CẤP
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Khay trung chuyển mặt hàng trống. Không thể lập vận đơn." };
  }

  // =========================================================================
  // MÀNG BẢO VỆ CHÍ MẠNG: IDEMPOTENCY LOCK (CHỐNG SPAM / TẠO ĐƠN TRÙNG LẶP)
  // =========================================================================
  const fingerprintKey = `${userId}:${JSON.stringify(input.items)}`;
  const nowTimestamp = Date.now();

  if (requestCacheLock.has(fingerprintKey)) {
    const lastRequestTime = requestCacheLock.get(fingerprintKey) || 0;
    // Nếu khoảng cách giữa 2 request nhỏ hơn 5 giây ➔ Chặn đứng hỏa tốc
    if (nowTimestamp - lastRequestTime < 5000) {
      return {
        success: false,
        error: "[⚠️ AN NINH LƯỢNG TỬ]: Hệ thống phát hiện xung request tạo đơn liên tiếp trùng lặp. Lệnh xử lý bị khóa chặn trong 5 giây để chống spam kho sinh khối."
      };
    }
  }

  // Ghi nhận dấu vân tay request hợp lệ vào bộ nhớ đệm
  requestCacheLock.set(fingerprintKey, nowTimestamp);

  try {
    // 1. TRUY QUẤT GIÁ GỐC VÀ ĐỐI SOÁT TỒN KHO THỰC TẾ
    const productIds = input.items.map(i => i.productId);
    const { data: dbProducts, error: prodError } = await supabaseServiceRole
      .from("products")
      .select("id, price, in_stock, name")
      .in("id", productIds);

    if (prodError || !dbProducts) {
      // Giải phóng khóa cache nếu gãy luồng truy vấn kho
      requestCacheLock.delete(fingerprintKey);
      return { success: false, error: `[Lỗi Kho]: ${prodError?.message || "Không thể truy xuất giá trần"}` };
    }

    let subtotal = 0;
    for (const item of input.items) {
      const matchedProd = (dbProducts as unknown as DbProductResponse[]).find(p => p.id === item.productId);
      if (!matchedProd) {
        requestCacheLock.delete(fingerprintKey);
        return { success: false, error: "Phát hiện mã gen mô nấm không tồn tại trong kho lưu trữ." };
      }
      if (!matchedProd.in_stock) {
        requestCacheLock.delete(fingerprintKey);
        return { success: false, error: `Mẫu vật [${matchedProd.name}] đã hết hàng sinh khối khả dụng.` };
      }
      subtotal += matchedProd.price * item.quantity;
    }

    // 2. XỬ LÝ MÀNG LỌC VOUCHER TẦNG SERVER
    let discount = 0;
    if (input.voucherCode) {
      const { data: voucher, error: vchError } = await supabaseServiceRole
        .from("vouchers")
        .select("*")
        .eq("code", input.voucherCode.toUpperCase().trim())
        .maybeSingle();

      if (!vchError && voucher) {
        if (subtotal >= Number(voucher.min_subtotal)) {
          const expiryDate = new Date(voucher.expiry_date);
          const currentDate = new Date("2026-06-14"); 

          if (expiryDate >= currentDate) {
            if (voucher.discount_type === "PERCENT") {
              discount = (subtotal * Number(voucher.discount_value)) / 100;
            } else {
              discount = Number(voucher.discount_value);
            }
          }
        }
      }
    }

    const shippingFee = subtotal > 2000000 ? 0 : 35000; 
    const grandTotal = Math.max(0, subtotal - discount + shippingFee);

    const timestampNano = Date.now().toString().slice(-5);
    const orderId = `MUSH-20260614-${timestampNano}`; 

    const formattedItemsJson = input.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity
    }));

    // 3. TRIỆU HỒI RPC TRANSACTION VỚI CHUỖI PHÂN RÃ CHI TIẾT
    const { data: txnResult, error: txnError } = await supabaseServiceRole.rpc(
      "deploy_secure_checkout_transaction",
      {
        p_order_id: orderId,
        p_user_id: userId,
        p_subtotal: subtotal,
        p_shipping_fee: shippingFee,
        p_discount: discount,
        p_grand_total: grandTotal,
        p_shipping_name: input.shippingName,
        p_shipping_phone: input.shippingPhone,
        p_shipping_detail: input.shippingDetail,
        p_shipping_area: input.shippingArea,
        p_payment_method: input.paymentMethod,
        p_items_json: formattedItemsJson,
        p_reference_code: `MUSH ${orderId.replace(/-/g, "")}`
      }
    );

    if (txnError) {
      requestCacheLock.delete(fingerprintKey); // Giải phóng khóa khi xảy ra crash lỗi DB
      return { success: false, error: `[DB Client Crash]: ${txnError.message} (Code: ${txnError.code})` };
    }

    if (!txnResult || txnResult.success === false) {
      requestCacheLock.delete(fingerprintKey); // Giải phóng khóa khi SQL Engine từ chối
      return { success: false, error: `[DB SQL Engine Error]: ${txnResult?.message || "Giao dịch thất bại vô căn cứ"}` };
    }

    // Sau 10 giây, tự động dọn sạch dấu vân tay cũ khỏi RAM để tiết kiệm tài nguyên Server
    setTimeout(() => {
      requestCacheLock.delete(fingerprintKey);
    }, 10000);

    return { success: true, orderId: orderId };
  } catch (err: unknown) {
    requestCacheLock.delete(fingerprintKey); // Giải phóng khóa khi nhảy vào catch block
    return { 
      success: false, 
      error: `[Server Action Exception]: ${err instanceof Error ? err.message : "Sập luồng không xác định"}` 
    };
  }
}