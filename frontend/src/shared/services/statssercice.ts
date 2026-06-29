import { api } from "./axiosconfig/config";

interface IYearSummaryResponse {
  total_books: number;
  total_pages: number;
  top_genre: string | null;
  top_author: string | null;
  favorite_book: {
    id: string;
    title: string;
    cover_url: string | null;
  } | null;
  avg_rating: number | null;
}

const getYearSummary = async (
  year: number,
): Promise<IYearSummaryResponse | Error> => {
  try {
    const { data } = await api.get("/stats/year-summary", {
      params: {
        year,
      },
    });

    if (data) {
      return data;
    }

    throw new Error("Erro ao buscar resumo anual");
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Erro ao buscar resumo anual";

    return new Error(message);
  }
};

export const statsService = {
  getYearSummary,
};
