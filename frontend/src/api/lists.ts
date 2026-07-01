import { BookList, ListCreate, ListUpdate, ReorderRequest } from '@/types/api';

import { api } from './client';

/** GET /users/lists — todas as listas do usuário (com livros). */
export async function getUserLists(): Promise<BookList[]> {
  const { data } = await api.get<BookList[]>('/users/lists');
  return data;
}

/** GET /lists/{id}. */
export async function getList(listId: string): Promise<BookList> {
  const { data } = await api.get<BookList>(`/lists/${listId}`);
  return data;
}

/** POST /lists/ — título obrigatório. */
export async function createList(body: ListCreate): Promise<BookList> {
  const { data } = await api.post<BookList>('/lists/', body);
  return data;
}

/** PATCH /lists/{id}. */
export async function updateList(listId: string, body: ListUpdate): Promise<BookList> {
  const { data } = await api.patch<BookList>(`/lists/${listId}`, body);
  return data;
}

/** DELETE /lists/{id}. */
export async function deleteList(listId: string): Promise<void> {
  await api.delete(`/lists/${listId}`);
}

/** POST /lists/{id}/books — 409 se o livro já está na lista. */
export async function addBookToList(listId: string, bookId: string): Promise<BookList> {
  const { data } = await api.post<BookList>(`/lists/${listId}/books`, { book_id: bookId });
  return data;
}

/** DELETE /lists/{id}/books/{bookId}. */
export async function removeBookFromList(listId: string, bookId: string): Promise<void> {
  await api.delete(`/lists/${listId}/books/${bookId}`);
}

/** PATCH /lists/{id}/books/reorder — posições sequenciais a partir de 1, todos os livros. */
export async function reorderListBooks(listId: string, body: ReorderRequest): Promise<BookList> {
  const { data } = await api.patch<BookList>(`/lists/${listId}/books/reorder`, body);
  return data;
}
