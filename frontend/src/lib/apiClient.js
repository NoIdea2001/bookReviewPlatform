import axios from "axios";
import { useAuth } from "../state/auth.store.js";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().clearCredentials();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
