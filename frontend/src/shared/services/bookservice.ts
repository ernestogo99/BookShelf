import type {
  IBookDetailResponse,
  IReviewResponse,
  IPaginatedResponse,
} from "../interfaces";

import { api } from "./axiosconfig/config";

const search = async (
  query: string,
): Promise<IBookDetailResponse[] | Error> => {
  try {
    const { data } = await api.get("/books/search", {
      params: {
        q: query,
      },
    });

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar livros");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar livros";

    return new Error(message);
  }
};

const getById = async (id: string): Promise<IBookDetailResponse | Error> => {
  try {
    const { data } = await api.get(`/books/${id}`);

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar livro");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar livro";

    return new Error(message);
  }
};

const getReviews = async (
  bookId: string,
  page = 1,
  perPage = 20,
): Promise<IPaginatedResponse<IReviewResponse> | Error> => {
  try {
    const { data } = await api.get(`/books/${bookId}/reviews`, {
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

export const bookService = {
  search,
  getById,
  getReviews,
};
