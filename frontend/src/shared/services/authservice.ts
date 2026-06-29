import type {
  IUserCreate,
  ILoginInput,
  ITokenResponse,
  IUserResponse,
} from "../interfaces";

import { api } from "./axiosconfig/config";

interface IRegisterResponse extends ITokenResponse {
  user: IUserResponse;
}

const register = async (
  user: IUserCreate,
): Promise<IRegisterResponse | Error> => {
  try {
    const { data } = await api.post("/auth/register", user);

    if (data) {
      return data;
    }

    throw new Error("Erro ao realizar cadastro");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao realizar cadastro";

    return new Error(message);
  }
};

const login = async (
  loginData: ILoginInput,
): Promise<ITokenResponse | Error> => {
  try {
    const { data } = await api.post("/auth/login", loginData);

    if (data) {
      return data;
    }

    throw new Error("Erro ao realizar login");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao realizar login";

    return new Error(message);
  }
};

export const authService = {
  register,
  login,
};
