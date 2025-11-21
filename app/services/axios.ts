import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Example: log requests
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest._retry && error.code === "ECONNABORTED") {
      originalRequest._retry = true;
      console.warn("⏳ Retrying request...");
      return api(originalRequest);
    }

    console.error("❌ API Error:", error.response?.status, error.message);

    return Promise.reject(error);
  }
);

export default api;
