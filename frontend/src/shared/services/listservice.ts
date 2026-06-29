import type {
  IAddBookInput,
  IListCreate,
  IListResponse,
  IListUpdate,
  IReorderInput,
} from "../interfaces";

import { api } from "./axiosconfig/config";

const create = async (input: IListCreate): Promise<IListResponse | Error> => {
  try {
    const { data } = await api.post("/lists", input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao criar lista");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao criar lista";

    return new Error(message);
  }
};

const getById = async (id: string): Promise<IListResponse | Error> => {
  try {
    const { data } = await api.get(`/lists/${id}`);

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar lista");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao buscar lista";

    return new Error(message);
  }
};

const update = async (
  id: string,
  input: IListUpdate,
): Promise<IListResponse | Error> => {
  try {
    const { data } = await api.patch(`/lists/${id}`, input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao atualizar lista");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao atualizar lista";

    return new Error(message);
  }
};

const remove = async (id: string): Promise<void | Error> => {
  try {
    await api.delete(`/lists/${id}`);
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao excluir lista";

    return new Error(message);
  }
};

const addBook = async (
  listId: string,
  input: IAddBookInput,
): Promise<IListResponse | Error> => {
  try {
    const { data } = await api.post(`/lists/${listId}/books`, input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao adicionar livro à lista");
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Erro ao adicionar livro à lista";

    return new Error(message);
  }
};

const removeBook = async (
  listId: string,
  bookId: string,
): Promise<void | Error> => {
  try {
    await api.delete(`/lists/${listId}/books/${bookId}`);
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Erro ao remover livro da lista";

    return new Error(message);
  }
};

const reorderBooks = async (
  listId: string,
  input: IReorderInput,
): Promise<IListResponse | Error> => {
  try {
    const { data } = await api.patch(`/lists/${listId}/books/reorder`, input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao reordenar livros");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao reordenar livros";

    return new Error(message);
  }
};

export const listService = {
  create,
  getById,
  update,
  remove,
  addBook,
  removeBook,
  reorderBooks,
};
