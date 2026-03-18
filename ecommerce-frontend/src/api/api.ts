import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9091/api",
});

// Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ❗ Do NOT attach token for login/register
    if (
      token &&
      !config.url?.includes("/auth/login") &&
      !config.url?.includes("/auth/register")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default api;
