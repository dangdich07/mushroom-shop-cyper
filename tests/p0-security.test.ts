import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "../src/features/checkout/checkoutSchema";

const root = process.cwd();
const action = readFileSync(join(root, "src/features/checkout/actions.ts"), "utf8");
const webhookRoute = readFileSync(join(root, "src/app/api/payments/verify/route.ts"), "utf8");
const trackingPage = readFileSync(join(root, "src/app/(shop)/track-order/page.tsx"), "utf8");
const migrationA = readFileSync(join(root, "supabase/migrations/20260717_01_add_inventory_and_idempotency.sql"), "utf8");
const migrationB = readFileSync(join(root, "supabase/migrations/20260717_02_finalize_inventory_and_secure_checkout.sql"), "utf8");

const validCheckout = {
  shippingName: "Nguyen Van An",
  shippingPhone: "0912345678",
  shippingDetail: "12 Nguyen Trai, Quan 1",
  shippingArea: "HCM",
  paymentMethod: "VIETQR",
  items: [{ productId: "prod-1", variantId: "11111111-1111-4111-8111-111111111111", quantity: 1 }],
};

describe("P0 checkout input", () => {
  it("accepts a valid checkout and rejects invalid Vietnamese phone numbers", () => {
    expect(checkoutInputSchema.safeParse(validCheckout).success).toBe(true);
    expect(checkoutInputSchema.safeParse({ ...validCheckout, shippingPhone: "123" }).success).toBe(false);
  });

  it("enforces quantity from 1 to 99 and rejects duplicate product lines", () => {
    expect(checkoutInputSchema.safeParse({ ...validCheckout, items: [{ productId: "prod-1", variantId: "11111111-1111-4111-8111-111111111111", quantity: 0 }] }).success).toBe(false);
    expect(checkoutInputSchema.safeParse({ ...validCheckout, items: [{ productId: "prod-1", variantId: "11111111-1111-4111-8111-111111111111", quantity: 100 }] }).success).toBe(false);
    expect(checkoutInputSchema.safeParse({ ...validCheckout, items: [
      { productId: "prod-1", variantId: "11111111-1111-4111-8111-111111111111", quantity: 1 },
      { productId: "prod-1", variantId: "11111111-1111-4111-8111-111111111111", quantity: 2 },
    ] }).success).toBe(false);
  });
});

describe("P0 security contracts", () => {
  it("preserves lowercase hex characters when extracting an order id from a webhook", () => {
    const description = "MUSH MUSH-20260717-97020e764376bb3b";
    const orderMatch = description.match(/MUSH\s+(MUSH-\d{8}-[A-F0-9]{16})/i);
    expect(orderMatch?.[1]).toBe("MUSH-20260717-97020e764376bb3b");
    expect(webhookRoute).toContain("payload.data.description.match(/MUSH\\s+(MUSH-\\d{8}-[A-F0-9]{16})/i)");
    expect(webhookRoute).not.toContain("payload.data.description.toUpperCase().match");
  });

  it("authenticates the cookie session and never accepts a client userId", () => {
    expect(action).toContain("sessionClient.auth.getUser()");
    expect(action).toContain("p_user_id: user.id");
    expect(action).not.toMatch(/createOrderAction\([^)]*userId/);
  });

  it("does not accept client price or totals in the checkout input", () => {
    for (const field of ["subtotal", "shippingFee", "discount", "grandTotal", "paymentStatus"]) {
      expect(JSON.stringify(validCheckout)).not.toContain(field);
    }
    expect(migrationB).toContain("v_subtotal := v_subtotal + v_product.price * v_quantity");
  });

  it("validates voucher state, expiry, threshold and caps discount", () => {
    expect(migrationB).toContain("not v_voucher.is_active");
    expect(migrationB).toContain("v_voucher.expiry_date < current_date");
    expect(migrationB).toContain("v_subtotal < v_voucher.min_subtotal");
    expect(migrationB).toContain("v_discount := least(v_discount, v_subtotal)");
  });

  it("serializes idempotency and rejects a reused key with another hash", () => {
    expect(migrationA).toContain("unique (user_id, idempotency_key)");
    expect(migrationB).toMatch(/checkout_idempotency[\s\S]*for update/);
    expect(migrationB).toContain("IDEMPOTENCY_CONFLICT");
    expect(migrationB).toContain("status = 'COMPLETED'");
  });

  it("locks stock, rejects unverified inventory and prevents overselling", () => {
    expect(migrationB).toMatch(/from public\.products where id = v_product_id for update/);
    expect(migrationB).toContain("v_product.stock_quantity is null");
    expect(migrationB).toContain("v_product.stock_quantity - v_product.reserved_quantity < v_quantity");
    expect(migrationA).not.toContain("stock_quantity = 100");
  });

  it("uses Asia/Ho_Chi_Minh for display codes while retaining timestamptz expiry", () => {
    expect(migrationB).toContain("time zone 'Asia/Ho_Chi_Minh'");
    expect(migrationA).toContain("inventory_expires_at timestamptz");
  });

  it("implements 15-minute VietQR and 24-hour COD reservations with batch release", () => {
    expect(migrationB).toContain("interval '24 hours'");
    expect(migrationB).toContain("interval '15 minutes'");
    expect(migrationB).toContain("process_expired_reservations");
    expect(migrationB).toContain("for update of o skip locked");
  });

  it("stores only a tracking token hash and exposes a restricted public RPC", () => {
    expect(migrationA).toContain("tracking_token_hash bytea");
    expect(migrationB).toContain("extensions.digest(p_tracking_token,'sha256')");
    expect(migrationB).toContain("and is_public=true");
    expect(migrationB).not.toMatch(/get_public_order_tracking[\s\S]*shipping_phone/);
  });

  it("preserves lowercase hex characters in owner and public tracking lookups", () => {
    expect(trackingPage).toContain("const orderId = id?.trim();");
    expect(trackingPage).not.toContain("id?.trim().toUpperCase()");
    expect(migrationB).toContain("where id=btrim(p_order_id)");
    expect(migrationB).not.toContain("where id=upper(btrim(p_order_id))");
  });
});
