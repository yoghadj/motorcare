import { z } from "zod";

const email = z.string().email("Invalid email format").toLowerCase();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z
  .object({
    email,
    password,
    name: z.string().min(1, "Name is required").max(100).optional(),
    phone: z.string().max(20).optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and privacy policy" }),
    }),
  })
  .strict();

export const loginSchema = z.object({ email, password }).strict();

export const profileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email,
    phone: z.string().max(20).optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: password,
  })
  .strict();

export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: password,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
