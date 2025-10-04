import apiClient from "../lib/apiClient.js";

export const getBooks = async (params) => {
  const { data } = await apiClient.get("/books", { params });
  return data;
};

export const getBookById = async (bookId) => {
  const { data } = await apiClient.get(`/books/${bookId}`);
  return data;
};

export const createBook = async (payload) => {
  const { data } = await apiClient.post("/books", payload);
  return data;
};

export const updateBook = async (bookId, payload) => {
  const { data } = await apiClient.put(`/books/${bookId}`, payload);
  return data;
};

export const deleteBook = async (bookId) => {
  const { data } = await apiClient.delete(`/books/${bookId}`);
  return data;
};
