"use server";

import { z } from "zod";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

interface NewsletterState {
  message: string;
  status: "IDLE" | "SUCCESS" | "DUPLICATE" | "ERROR";
}

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function subscribeNewsletter(
  _previousState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "ERROR", message: "Email chưa đúng định dạng." };

  const { error } = await supabaseServiceRole.from("newsletter_subscribers").insert({
    email: parsed.data.email,
    source: "FOOTER",
  });

  if (!error) return { status: "SUCCESS", message: "Đăng ký bản tin thành công." };
  if (error.code === "23505") return { status: "DUPLICATE", message: "Email này đã đăng ký bản tin." };

  console.error("Newsletter subscription failed", { code: error.code });
  return { status: "ERROR", message: "Chưa thể đăng ký bản tin lúc này." };
}
