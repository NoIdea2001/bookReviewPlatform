import apiClient from "../lib/apiClient.js";

export const getCurrentUserProfile = async () => {
  const { data } = await apiClient.get("/users/me");
  return data;
};
