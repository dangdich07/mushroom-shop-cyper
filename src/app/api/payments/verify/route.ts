import { createHash, createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

const webhookSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  event_id: z.union([z.string(), z.number()]).optional(),
  data: z.object({
    id: z.union([z.string(), z.number()]).optional(),
    description: z.string().min(1).max(500),
    amount: z.coerce.number().positive(),
    transaction_id: z.union([z.string(), z.number()]).optional(),
  }),
});

function verifyWebhookSignature(rawBody: string, incomingSignature: string, secret: string) {
  if (!/^[a-fA-F0-9]{64}$/.test(incomingSignature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const incoming = Buffer.from(incomingSignature, "hex");
  return incoming.length === expected.length && timingSafeEqual(expected, incoming);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32 * 1024) {
    return NextResponse.json({ error: "Webhook vượt quá dung lượng cho phép." }, { status: 413 });
  }
  const rawBody = await request.text();
  const signature = request.headers.get("x-api-signature");
  const secret = process.env.PAYMENT_GATEWAY_SECRET;

  if (!signature || !secret || !verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn("Payment webhook signature rejected", {
      payloadHash: createHash("sha256").update(rawBody).digest("hex"),
    });
    return NextResponse.json({ error: "Webhook không hợp lệ." }, { status: 403 });
  }

  const parsedJson = (() => {
    try { return JSON.parse(rawBody) as unknown; } catch { return null; }
  })();
  const parsed = webhookSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu webhook không hợp lệ." }, { status: 400 });
  }

  const payload = parsed.data;
  const eventId = String(payload.event_id ?? payload.id ?? payload.data.id ?? "").trim();
  // Match the transfer description case-insensitively while preserving the
  // exact order-id casing stored in PostgreSQL.
  const orderMatch = payload.data.description.match(/MUSH\s+(MUSH-\d{8}-[A-F0-9]{16})/i);
  if (!eventId || !orderMatch) {
    return NextResponse.json({ error: "Không xác định được giao dịch." }, { status: 400 });
  }

  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const { data, error } = await supabaseServiceRole.rpc("mark_payment_paid_atomic", {
    p_provider_event_id: eventId,
    p_payload_hash: payloadHash,
    p_order_id: orderMatch[1],
    p_amount: payload.data.amount,
    p_gateway_transaction_id: payload.data.transaction_id ? String(payload.data.transaction_id) : null,
  });

  if (error) {
    console.error("Payment webhook RPC failed", { code: error.code });
    return NextResponse.json({ error: "Không thể xử lý giao dịch." }, { status: 500 });
  }
  const result = data as { success?: boolean; error_code?: string } | null;
  if (!result?.success) {
    const status = result?.error_code === "PAYMENT_EXPIRED" ? 409 : 400;
    return NextResponse.json({ error: "Giao dịch không được chấp nhận." }, { status });
  }

  return NextResponse.json({ success: true, message: "Thanh toán đã được xác nhận." });
}
