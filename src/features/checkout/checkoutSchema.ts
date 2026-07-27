import { z } from "zod";

const vietnamesePhone = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const checkoutInputSchema = z.object({
  shippingName: z.string().trim().min(2).max(120),
  shippingPhone: z.string().trim().regex(vietnamesePhone),
  shippingDetail: z.string().trim().min(5).max(300),
  shippingArea: z.enum(["HANOI", "DANANG", "HCM"]),
  paymentMethod: z.enum(["VIETQR", "COD"]),
  voucherCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,50}$/).optional(),
  items: z.array(z.object({
    productId: z.string().trim().min(1).max(100),
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
}).superRefine((input, context) => {
  const ids = new Set<string>();
  input.items.forEach((item, index) => {
    if (ids.has(item.variantId)) {
      context.addIssue({ code: "custom", path: ["items", index, "variantId"], message: "Biến thể bị trùng." });
    }
    ids.add(item.variantId);
  });
});

export const idempotencyKeySchema = z.string().uuid();
