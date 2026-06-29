import type { IReadingCreate, IReadingResponse } from "../interfaces";

import { api } from "./axiosconfig/config";

const upsert = async (
  input: IReadingCreate,
): Promise<IReadingResponse | Error> => {
  try {
    const { data } = await api.post("/readings", input);

    if (data) {
      return data;
    }

    throw new Error("Erro ao registrar leitura");
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao registrar leitura";

    return new Error(message);
  }
};

const remove = async (readingId: string): Promise<void | Error> => {
  try {
    await api.delete(`/readings/${readingId}`);
  } catch (error: any) {
    const message = error.response?.data?.detail || "Erro ao remover leitura";

    return new Error(message);
  }
};

export const readingService = {
  upsert,
  remove,
};
