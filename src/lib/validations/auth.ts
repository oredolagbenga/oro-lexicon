import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;