import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(
  join(
    root,
    "supabase/migrations/20260728_09_loyalty_promotion_wheel.sql",
  ),
  "utf8",
);
const wheel = readFileSync(
  join(root, "src/components/promotion/lucky-wheel.tsx"),
  "utf8",
);
const promotions = readFileSync(
  join(root, "src/app/promotions/page.tsx"),
  "utf8",
);

describe("P2 loyalty promotion wheel", () => {
  it("never invents or backfills production loyalty points", () => {
    expect(migration).toContain("points integer not null default 0");
    expect(migration).not.toMatch(/update public\.loyalty_wallets[\s\S]*points\s*=\s*[1-9]\d*/);
    expect(migration).not.toContain("stock_quantity = 100");
  });

  it("awards delivered orders once through an immutable ledger source", () => {
    expect(migration).toContain("new.status <> 'DELIVERED'");
    expect(migration).toContain("floor(new.grand_total / 10000)");
    expect(migration).toContain("unique (user_id, reason, source_ref)");
    expect(migration).toContain("reason = 'ORDER_DELIVERED'");
  });

  it("serializes spins and cannot debit a wallet below zero", () => {
    expect(migration).toMatch(/promotion_spin_events[\s\S]*for update/);
    expect(migration).toMatch(/loyalty_wallets[\s\S]*for update/);
    expect(migration).toContain("and points >= v_cost");
    expect(migration).toContain("INSUFFICIENT_LOYALTY_POINTS");
    expect(migration).toContain("unique (user_id, idempotency_key)");
  });

  it("chooses the reward on the server and records both reward and debit", () => {
    expect(migration).toContain("v_spin.random_seed");
    expect(migration).toContain("insert into public.user_promotion_rewards");
    expect(migration).toContain("'PROMOTION_SPIN'");
    expect(wheel).not.toContain("Math.random");
    expect(promotions).toContain('supabase.rpc("spin_promotion_wheel"');
  });

  it("uses cookie-authenticated identity and exposes the RPC only to authenticated", () => {
    expect(migration).toContain("v_user_id := auth.uid()");
    expect(migration).toMatch(
      /revoke execute on function public\.spin_promotion_wheel\(uuid\)[\s\S]*from public, anon, authenticated, service_role/,
    );
    expect(migration).toMatch(
      /grant execute on function public\.spin_promotion_wheel\(uuid\)[\s\S]*to authenticated/,
    );
    expect(migration).toContain("set search_path = ''");
  });

  it("keeps wallet, ledger, spins and rewards private to their owner", () => {
    for (const table of [
      "loyalty_wallets",
      "loyalty_point_ledger",
      "promotion_spin_events",
      "user_promotion_rewards",
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
    expect(migration).toContain("using (user_id = auth.uid())");
  });
});
