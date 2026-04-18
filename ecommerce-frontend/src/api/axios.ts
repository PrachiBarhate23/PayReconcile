import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {

    // 🚫 Do NOT attach token for login or register
    if (
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register")
    ) {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
