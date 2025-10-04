import apiClient from "../lib/apiClient.js";

export const signup = async (payload) => {
  const { data } = await apiClient.post("/auth/signup", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};
