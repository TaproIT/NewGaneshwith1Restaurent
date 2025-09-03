import axios from "axios";

// Use URLs from .env file
const LOCAL_API_URL = import.meta.env.VITE_API_URL_LOCAL;
const DEV_API_URL = import.meta.env.VITE_API_URL_DEV;

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? LOCAL_API_URL : DEV_API_URL),
  withCredentials: true, // send cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Example: add Authorization header if token exists
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // You can handle global response formatting here
    return response;
  },
  async (error) => {
    if (error.response) {
      // Example: if unauthorized, redirect to login
      if (error.response.status === 401) {
        // optionally remove token
        localStorage.removeItem("authToken");
        window.location.href = "/"; // redirect to login
      }
    }
    return Promise.reject(error);
  }
);
