export interface IBookResponse {
  id: string;
  ol_key?: string;
  title: string;
  authors: string[];
  publisher?: string;
  published_year?: number;
  pages?: number;
  synopsis?: string;
  cover_url?: string;
  genres?: string[];
  avg_rating: number;
  total_ratings: number;
}

export interface IBookDetailResponse extends IBookResponse {
  my_reading?: IReadingEmbedded;
}

export interface IReadingEmbedded {
  id: string;
  status: string;
  rating?: number;
}
