import { IUserResponse } from "./user";

export interface IReviewCreate {
  book_id: string;
  content: string;
  has_spoiler?: boolean;
}

export interface IReviewUpdate {
  content?: string;
  has_spoiler?: boolean;
}

export interface IReviewResponse {
  id: string;
  book_id: string;
  content: string;
  has_spoiler: boolean;
  created_at: string;
  updated_at: string;
  author: IUserResponse;
}
