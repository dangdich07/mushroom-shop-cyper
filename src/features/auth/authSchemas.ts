import { z } from "zod";

const email = z.string().trim().email().max(254);
const password = z.string().min(8).max(72);
const phone = z.string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ""))
  .refine((value) => /^(?:\+84|0)\d{9,10}$/.test(value), "INVALID_PHONE");

export const loginSchema = z.object({ email, password });
export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email,
  phone,
  password,
  confirmPassword: z.string(),
  acceptedTerms: z.literal(true),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "PASSWORD_MISMATCH",
});
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "PASSWORD_MISMATCH",
});
