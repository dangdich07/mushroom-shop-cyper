import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../src/features/auth/authSchemas";
import { getSafeInternalRedirect } from "../src/features/auth/safeRedirect";

const root = process.cwd();
const catalogRepository = readFileSync(
  join(root, "src/features/catalog/catalogRepository.ts"),
  "utf8",
);
const productsPage = readFileSync(
  join(root, "src/app/(shop)/products/page.tsx"),
  "utf8",
);
const catalogMigration = readFileSync(
  join(root, "supabase/migrations/20260725_05_catalog_indexes.sql"),
  "utf8",
);

describe("P1 auth validation", () => {
  it("validates login credentials and password confirmation", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "password123" }).success).toBe(false);
    expect(registerSchema.safeParse({
      fullName: "Nguyen Van An",
      email: "user@example.com",
      password: "password123",
      confirmPassword: "different",
    }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "password123",
    }).success).toBe(true);
  });

  it("only accepts local redirect paths", () => {
    expect(getSafeInternalRedirect("/account?tab=orders")).toBe("/account?tab=orders");
    expect(getSafeInternalRedirect("https://evil.example")).toBe("/account");
    expect(getSafeInternalRedirect("//evil.example")).toBe("/account");
    expect(getSafeInternalRedirect("/\\evil.example")).toBe("/account");
  });
});

describe("P1 catalog contracts", () => {
  it("queries only sellable Supabase products with server-side filters and pagination", () => {
    expect(catalogRepository).toContain('.from("products")');
    expect(catalogRepository).toContain('.eq("in_stock", true)');
    expect(catalogRepository).toContain("name.ilike");
    expect(catalogRepository).toContain("sku.ilike");
    expect(catalogRepository).toContain(".range(start, end)");
    expect(catalogRepository).toContain('{ count: "exact" }');
  });

  it("uses mock data only behind the explicit data-source flag", () => {
    expect(catalogRepository).toContain('NEXT_PUBLIC_DATA_SOURCE === "MOCK"');
    expect(catalogRepository).toContain('throw new Error("CATALOG_QUERY_FAILED")');
  });

  it("keys queries by filters and debounces search", () => {
    expect(productsPage).toContain('queryKey: ["catalog", filters]');
    expect(productsPage).toContain("useDebouncedValue(searchInput, 350)");
    expect(productsPage).not.toContain("as unknown as ExpectedCartStore");
  });

  it("adds indexes without modifying product data", () => {
    expect(catalogMigration).toContain("begin;");
    expect(catalogMigration).toContain("create index if not exists");
    expect(catalogMigration).not.toMatch(/\b(update|delete|truncate)\s+public\.products\b/i);
  });
});
