import { z } from "zod";


export const registerZodSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type IRegisterPayload = z.infer<typeof registerZodSchema>;




export const loginZodSchema = z.object({
    email : z.email("Invalid email address"),
    password : z.string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
})


export type ILoginPayload = z.infer<typeof loginZodSchema>;



export const forgotPasswordZodSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type IForgotPasswordPayload = z.infer<typeof forgotPasswordZodSchema>;
