import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "../src/features/checkout/checkoutSchema";

const root = process.cwd();
const store = readFileSync(join(root, "src/store/useCartStore.ts"), "utf8");
const structure = readFileSync(
  join(root, "supabase/migrations/20260725_06_product_variants.sql"),
  "utf8",
);
const checkout = readFileSync(
  join(root, "supabase/migrations/20260725_07_variant_checkout.sql"),
  "utf8",
);
const serviceRoleGrant = readFileSync(
  join(root, "supabase/migrations/20260726_08_grant_variant_service_role_select.sql"),
  "utf8",
);

describe("P1 product variants", () => {
  it("allows two variants of one product and rejects a duplicated variant", () => {
    const base = {
      shippingName: "Nguyen Van An",
      shippingPhone: "0912345678",
      shippingDetail: "12 Nguyen Trai, Quan 1",
      shippingArea: "HCM",
      paymentMethod: "COD",
    };
    const first = "11111111-1111-4111-8111-111111111111";
    const second = "22222222-2222-4222-8222-222222222222";
    expect(checkoutInputSchema.safeParse({
      ...base,
      items: [
        { productId: "prod-1", variantId: first, quantity: 1 },
        { productId: "prod-1", variantId: second, quantity: 1 },
      ],
    }).success).toBe(true);
    expect(checkoutInputSchema.safeParse({
      ...base,
      items: [
        { productId: "prod-1", variantId: first, quantity: 1 },
        { productId: "prod-1", variantId: first, quantity: 1 },
      ],
    }).success).toBe(false);
  });

  it("keys persisted cart lines by variant and discards unsafe legacy lines", () => {
    expect(store).toContain("item.lineId === product.lineId");
    expect(store).toContain("Boolean(item.variantId && item.lineId)");
    expect(store).toContain("version: 2");
  });

  it("backfills exact legacy stock and order item links without fake inventory", () => {
    expect(structure).toContain("p.stock_quantity, p.reserved_quantity");
    expect(structure).toContain("update public.order_items oi");
    expect(structure).toContain("set variant_id =");
    expect(structure).not.toContain("stock_quantity = 100");
  });

  it("locks variants in stable order and computes price from the database", () => {
    expect(checkout).toContain("order by value->>'variant_id'");
    expect(checkout).toMatch(/from public\.product_variants\s+where id=v_variant_id for update/);
    expect(checkout).toContain("v_subtotal:=v_subtotal+v_variant.price*v_quantity");
    expect(checkout).not.toMatch(/v_subtotal.*v_item->>'price'/);
  });

  it("commits, releases and restocks the selected variant atomically", () => {
    expect(checkout).toContain("stock_quantity=stock_quantity-v_item.quantity");
    expect(checkout).toContain("reserved_quantity=reserved_quantity-v_item.quantity");
    expect(checkout).toContain("stock_quantity=stock_quantity+v_item.quantity");
    expect(checkout).toContain("DELIVERED_ORDER_IS_TERMINAL");
  });

  it("keeps privileged RPC grants service-role only", () => {
    expect(checkout).toMatch(/revoke execute[\s\S]*from public,anon,authenticated/);
    expect(checkout).toMatch(/grant execute[\s\S]*to service_role/);
    expect(checkout).toContain("set search_path = ''");
  });

  it("grants server-rendered product reads to service role", () => {
    expect(serviceRoleGrant).toContain(
      "grant select on table public.product_variants, public.product_images",
    );
    expect(serviceRoleGrant).toContain("to service_role");
  });
});
