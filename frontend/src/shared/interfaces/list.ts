import { IBookResponse } from "./book";

export interface IListCreate {
  title: string;
  description?: string;
}

export interface IListUpdate {
  title?: string;
  description?: string;
}

export interface IListBookResponse {
  book: IBookResponse;
  position: number;
}

export interface IListResponse {
  id: string;
  title: string;
  description?: string;
  books: IListBookResponse[];
  created_at: string;
  updated_at: string;
}

export interface IAddBookInput {
  book_id: string;
}

export interface IReorderItem {
  book_id: string;
  position: number;
}

export interface IReorderInput {
  items: IReorderItem[];
}
