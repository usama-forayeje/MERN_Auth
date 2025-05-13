import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string({
      required_error: "📧 Email is required",
      invalid_type_error: "📧 Email must be a string",
    })
    .email("📧 Must be a valid email"),

  userName: z
    .string({
      required_error: "👤 Username is required",
    })
    .min(3, "👤 Username must be at least 3 characters long")
    .max(20, "👤 Username must not exceed 20 characters"),

  password: z
    .string({
      required_error: "🔑 Password is required",
    })
    .min(6, "🔑 Password must be at least 6 characters long")
    .regex(/[A-Z]/, "🔐 Must contain at least one uppercase letter")
    .regex(/[0-9]/, "🔢 Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "💥 Must contain at least one special character"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: "🔑 Old password is required" })
    .min(6, "🔑 Old password must be at least 6 characters"),

  newPassword: z
    .string({ required_error: "🆕 New password is required" })
    .min(6, "🆕 New password must be at least 6 characters")
    .refine((val) => /[A-Z]/.test(val), {
      message: "🛡️ New password must contain at least one uppercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "🔢 New password must contain at least one number",
    }),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string({
      required_error: "OTP is required",
      invalid_type_error: "OTP must be a string",
    })
    .min(4, "OTP must be at least 4 characters"),
});
