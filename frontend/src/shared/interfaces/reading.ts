import { IBookResponse } from "./book";

export interface IReadingCreate {
  book_id: string;
  status: ReadingStatus;
  rating?: number;
}

export interface IReadingResponse {
  id: string;
  status: ReadingStatus;
  rating?: number;
  book: IBookResponse;
}

export type ReadingStatus = "read" | "reading" | "want_to_read";
