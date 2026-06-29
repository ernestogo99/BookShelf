import { IBookResponse } from "../interfaces";
import { api } from "./axiosconfig/config";

const getTrending = async (): Promise<IBookResponse[] | Error> => {
  try {
    const { data } = await api.get("/discover/trending");

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar livros em alta");
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Erro ao buscar livros em alta";

    return new Error(message);
  }
};

const getTopRated = async (): Promise<IBookResponse[] | Error> => {
  try {
    const { data } = await api.get("/discover/top-rated");

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar livros mais bem avaliados");
  } catch (error: any) {
    const message =
      error.response?.data?.detail ||
      "Erro ao buscar livros mais bem avaliados";

    return new Error(message);
  }
};

export const discoveryService = {
  getTrending,
  getTopRated,
};
