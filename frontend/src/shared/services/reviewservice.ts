import type {
  IReviewCreate,
  IReviewResponse,
  IReviewUpdate,
} from "../interfaces";

import { api } from "./axiosconfig/config";

const create = async (
  input: IReviewCreate,
): Promise<IReviewResponse | Error> => {
  try {
    const { data } = await api.post("/reviews", input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao criar resenha");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao criar resenha";

    return new Error(message);
  }
};

const update = async (
  reviewId: string,
  input: IReviewUpdate,
): Promise<IReviewResponse | Error> => {
  try {
    const { data } = await api.patch(`/reviews/${reviewId}`, input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao atualizar resenha");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao atualizar resenha";

    return new Error(message);
  }
};

const remove = async (reviewId: string): Promise<void | Error> => {
  try {
    await api.delete(`/reviews/${reviewId}`);
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao remover resenha";

    return new Error(message);
  }
};

export const reviewService = {
  create,
  update,
  remove,
};
