import type {
  IUserResponse,
  IUserUpdateInput,
  IUserStatsResponse,
  IPaginatedResponse,
  IReadingResponse,
  IReviewResponse,
  IListResponse,
} from "../interfaces";

import { api } from "./axiosconfig/config";

const getMe = async (): Promise<IUserResponse | Error> => {
  try {
    const { data } = await api.get("/users/");

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar usuário");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar usuário";

    return new Error(message);
  }
};

const updateMe = async (
  data: IUserUpdateInput,
): Promise<IUserResponse | Error> => {
  try {
    const response = await api.patch("/users/", data);

    if (response.data) {
      return response.data;
    }

    throw new Error("Erro ao atualizar usuário");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao atualizar usuário";

    return new Error(message);
  }
};

const getStats = async (): Promise<IUserStatsResponse | Error> => {
  try {
    const { data } = await api.get("/users/stats");

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar estatísticas");
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Erro ao buscar estatísticas";

    return new Error(message);
  }
};

const getReadings = async (
  page: number = 1,
  perPage: number = 20,
  status?: string,
): Promise<IPaginatedResponse<IReadingResponse> | Error> => {
  try {
    const { data } = await api.get("/users/readings", {
      params: {
        page,
        per_page: perPage,
        status,
      },
    });

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar leituras");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar leituras";

    return new Error(message);
  }
};

const getReviews = async (
  page: number = 1,
  perPage: number = 20,
): Promise<IPaginatedResponse<IReviewResponse> | Error> => {
  try {
    const { data } = await api.get("/users/reviews", {
      params: {
        page,
        per_page: perPage,
      },
    });

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar avaliações");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar avaliações";

    return new Error(message);
  }
};

const getLists = async (): Promise<IListResponse[] | Error> => {
  try {
    const { data } = await api.get("/users/lists");

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar listas");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar listas";

    return new Error(message);
  }
};

export const userService = {
  getMe,
  updateMe,
  getStats,
  getReadings,
  getReviews,
  getLists,
};
