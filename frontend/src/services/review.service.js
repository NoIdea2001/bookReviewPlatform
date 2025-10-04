import apiClient from "../lib/apiClient.js";

export const getReviews = async (bookId) => {
  const { data } = await apiClient.get(`/reviews/${bookId}`);
  return data;
};

export const addReview = async (bookId, payload) => {
  const { data } = await apiClient.post(`/reviews/${bookId}`, payload);
  return data;
};

export const updateReview = async (bookId, reviewId, payload) => {
  const { data } = await apiClient.put(
    `/reviews/${bookId}/${reviewId}`,
    payload
  );
  return data;
};

export const deleteReview = async (bookId, reviewId) => {
  const { data } = await apiClient.delete(`/reviews/${bookId}/${reviewId}`);
  return data;
};
