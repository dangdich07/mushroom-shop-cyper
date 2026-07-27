import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationA = readFileSync(join(root, "supabase/migrations/20260717_01_add_inventory_and_idempotency.sql"), "utf8");
const migrationB = readFileSync(join(root, "supabase/migrations/20260717_02_finalize_inventory_and_secure_checkout.sql"), "utf8");
const adminPage = readFileSync(join(root, "src/app/admin/orders/page.tsx"), "utf8");

const adminRpc = migrationB.slice(
  migrationB.indexOf("create or replace function public.admin_transition_order"),
  migrationB.indexOf("create or replace function public.get_public_order_tracking"),
);
const inventoryRpc = migrationB.slice(
  migrationB.indexOf("create or replace function public.transition_order_inventory"),
  migrationB.indexOf("create or replace function public.create_secure_checkout"),
);

describe("P0 legacy order transition contract", () => {
  it("allows only the forward legacy lifecycle or cancellation", () => {
    expect(adminRpc).toContain("v_order.inventory_status='NONE'");
    expect(adminRpc).toContain("v_order.status='PENDING' and p_new_status='PROCESSING'");
    expect(adminRpc).toContain("v_order.status='PROCESSING' and p_new_status='SHIPPED'");
    expect(adminRpc).toContain("v_order.status='SHIPPED' and p_new_status='DELIVERED'");
    expect(adminRpc).toContain("p_new_status='CANCELLED'");
    expect(adminRpc).toContain("INVALID_LEGACY_ORDER_TRANSITION");
  });

  it("forbids legacy restock and keeps its branch free of inventory transitions", () => {
    const legacyBranch = adminRpc.slice(adminRpc.indexOf("if v_is_legacy then"), adminRpc.indexOf("  else", adminRpc.indexOf("if v_is_legacy then")));
    expect(legacyBranch).toContain("LEGACY_ORDER_RESTOCK_FORBIDDEN");
    expect(legacyBranch).not.toContain("transition_order_inventory");
    expect(adminPage).toContain('activeOrder.inventory_status === "COMMITTED"');
  });
});

describe("P0 cancellation payment contract", () => {
  it("changes only PENDING or WAITING payments to FAILED", () => {
    expect(adminRpc).toContain("status in ('PENDING','WAITING')");
    expect(adminRpc).not.toContain("status <> 'PAID'");
    expect(migrationB).toMatch(/process_expired_reservations[\s\S]*status in \('PENDING','WAITING'\)/);
  });

  it("keeps repeated cancellation idempotent and supports release/restock paths", () => {
    expect(adminRpc).toContain("v_order.status='CANCELLED' and p_new_status='CANCELLED'");
    expect(adminRpc).toContain("'RELEASE','ADMIN_CANCELLED'");
    expect(adminRpc).toContain("'RESTOCK','ADMIN_CANCELLED_RESTOCK'");
  });
});

describe("P0 delivered terminal contract", () => {
  it("rejects legacy and managed DELIVERED cancellation with one explicit error", () => {
    expect(adminRpc).toContain("if v_order.status='DELIVERED' then");
    expect(adminRpc).toContain("DELIVERED_ORDER_IS_TERMINAL");
    expect(adminRpc).toContain("(p_new_status='CANCELLED' and v_order.status <> 'DELIVERED')");
  });

  it("rejects DELIVERED restock before any payment or inventory mutation", () => {
    const terminalGuard = adminRpc.indexOf("if v_order.status='DELIVERED' then");
    const terminalReturn = adminRpc.indexOf("DELIVERED_ORDER_IS_TERMINAL", terminalGuard);
    const firstInventoryCall = adminRpc.indexOf("transition_order_inventory");
    const firstPaymentUpdate = adminRpc.indexOf("update public.payments");
    expect(terminalGuard).toBeGreaterThan(-1);
    expect(terminalReturn).toBeGreaterThan(terminalGuard);
    expect(terminalReturn).toBeLessThan(firstInventoryCall);
    expect(terminalReturn).toBeLessThan(firstPaymentUpdate);
    expect(inventoryRpc).toContain("v_order.status = 'DELIVERED' and p_transition in ('RELEASE', 'RESTOCK')");
    expect(inventoryRpc.indexOf("DELIVERED_ORDER_IS_TERMINAL")).toBeLessThan(inventoryRpc.indexOf("set reserved_quantity ="));
    expect(inventoryRpc.indexOf("DELIVERED_ORDER_IS_TERMINAL")).toBeLessThan(inventoryRpc.indexOf("set stock_quantity = stock_quantity +"));
  });

  it("hides cancellation and restock controls for DELIVERED orders", () => {
    expect(adminPage).toContain('disabled={updateStatusMutation.isPending || activeOrder.status === "DELIVERED"}');
    expect(adminPage).toContain('activeOrder.status !== "DELIVERED" && <option value="CANCELLED"');
    expect(adminPage).toContain('activeOrder.status !== "DELIVERED" && activeOrder.inventory_status === "COMMITTED"');
  });
});

describe("P0 migration hardening contract", () => {
  it("preflights an existing pgcrypto extension before additive changes", () => {
    expect(migrationA).toContain("PGCRYPTO_PREFLIGHT_FAILED");
    expect(migrationA).toContain("e.extname = 'pgcrypto'");
    expect(migrationA).not.toContain("create extension if not exists pgcrypto");
    expect(migrationA.indexOf("PGCRYPTO_PREFLIGHT_FAILED")).toBeLessThan(migrationA.indexOf("create type public.inventory_status"));
  });

  it("revokes the deprecated checkout RPC from every API role", () => {
    expect(migrationB).toMatch(/deploy_secure_checkout_transaction[\s\S]*from public, anon, authenticated, service_role/);
  });
});
