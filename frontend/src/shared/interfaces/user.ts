import z from "zod";

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

export interface IUserUpdateInput {
  name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface ITokenResponse {
  access_token: string;
  token_type: string;
}

export interface IUserProfileResponse extends IUserResponse {
  total_read: number;
  total_reading: number;
  total_want_to_read: number;
}

export interface IUserStatsResponse {
  total_read: number;
  total_pages: number;
  avg_rating_given?: number;
  books_by_month: Record<string, number>;
  top_genres: Record<string, unknown>[];
}

//zod

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  username: z.string().min(3, "Username deve ter no mínimo 3 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});
