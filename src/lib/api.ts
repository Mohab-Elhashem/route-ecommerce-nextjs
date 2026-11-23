import axios from "axios";

export const API_BASE_URL = "https://ecommerce.routemisr.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) config.headers.token = token;
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { msg?: string } }
      | undefined;
    return data?.message || data?.errors?.msg || fallback;
  }
  return fallback;
}
