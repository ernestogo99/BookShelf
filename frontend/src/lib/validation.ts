import { z } from 'zod';

/**
 * Schemas de validação. Espelham as restrições do backend:
 * username 3–50, password 6–128, name 1–100, e-mail válido.
 */

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100, 'Máximo 100 caracteres'),
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^\S+$/, 'Não use espaços'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128, 'Máximo 128 caracteres'),
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100, 'Máximo 100 caracteres'),
  bio: z.string().max(150, 'Máximo 150 caracteres'),
  avatar_url: z.string().trim().max(500, 'URL muito longa'),
});

export type ProfileForm = z.infer<typeof profileSchema>;
