"use server";

import { createHash, randomBytes } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { checkoutInputSchema, idempotencyKeySchema } from "@/features/checkout/checkoutSchema";
import type { ServerActionResponse } from "@/types/payment.types";

interface CheckoutRpcResult {
  success?: boolean;
  order_id?: string;
  created?: boolean;
  expires_at?: string;
  error_code?: string;
}

const PUBLIC_ERRORS: Record<string, string> = {
  AUTH_REQUIRED: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  EMPTY_CART: "Giỏ hàng đang trống.",
  INVALID_ITEM: "Sản phẩm hoặc số lượng không hợp lệ.",
  PRODUCT_UNAVAILABLE: "Một sản phẩm trong giỏ hiện không còn khả dụng.",
  INVENTORY_NOT_VERIFIED: "Sản phẩm chưa hoàn tất kiểm kê và chưa thể đặt hàng.",
  INSUFFICIENT_STOCK: "Số lượng tồn kho không đủ cho đơn hàng này.",
  VOUCHER_INVALID: "Mã ưu đãi không hợp lệ, đã hết hạn hoặc chưa đạt giá trị tối thiểu.",
  IDEMPOTENCY_CONFLICT: "Yêu cầu đặt hàng bị trùng mã nhưng có nội dung khác.",
};

function canonicalizeCheckout(input: ReturnType<typeof checkoutInputSchema.parse>) {
  return {
    ...input,
    voucherCode: input.voucherCode || null,
    items: [...input.items].sort((a, b) => a.variantId.localeCompare(b.variantId)),
  };
}

export async function createOrderAction(
  rawInput: unknown,
  rawIdempotencyKey: string,
): Promise<ServerActionResponse> {
  const parsedInput = checkoutInputSchema.safeParse(rawInput);
  const parsedKey = idempotencyKeySchema.safeParse(rawIdempotencyKey);
  if (!parsedInput.success || !parsedKey.success) {
    return { success: false, error: "Thông tin đặt hàng không hợp lệ." };
  }

  try {
    const sessionClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    if (authError || !user) return { success: false, error: PUBLIC_ERRORS.AUTH_REQUIRED };

    const input = canonicalizeCheckout(parsedInput.data);
    const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    const trackingToken = randomBytes(32).toString("base64url");
    const trackingTokenHash = createHash("sha256").update(trackingToken).digest("hex");

    const { data, error } = await supabaseServiceRole.rpc("create_secure_checkout", {
      p_user_id: user.id,
      p_idempotency_key: parsedKey.data,
      p_request_hash: requestHash,
      p_items_json: input.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
      p_shipping_name: input.shippingName,
      p_shipping_phone: input.shippingPhone,
      p_shipping_detail: input.shippingDetail,
      p_shipping_area: input.shippingArea,
      p_payment_method: input.paymentMethod,
      p_voucher_code: input.voucherCode,
      p_tracking_token_hash: trackingTokenHash,
    });

    if (error) {
      console.error("Checkout RPC failed", { code: error.code });
      return { success: false, error: "Không thể tạo đơn hàng lúc này. Vui lòng thử lại." };
    }

    const result = data as CheckoutRpcResult | null;
    if (!result?.success || !result.order_id) {
      return {
        success: false,
        error: PUBLIC_ERRORS[result?.error_code || ""] || "Không thể tạo đơn hàng lúc này.",
      };
    }

    return {
      success: true,
      orderId: result.order_id,
      expiresAt: result.expires_at,
      trackingToken: result.created ? trackingToken : undefined,
    };
  } catch (error) {
    console.error("Checkout action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, error: "Không thể tạo đơn hàng lúc này. Vui lòng thử lại." };
  }
}
