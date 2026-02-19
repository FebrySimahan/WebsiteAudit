import axios from "axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "cached_user";
const CACHE_DURATION = 5 * 60 * 1000;

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authUtils = {

  login: async (name: string, password: string) => {
    const res = await api.post("/login", { name, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify({
      data: res.data.user,
      timestamp: Date.now()
    }));
    return res.data;
  },

  getUser: async () => {
    try {
      const cached = sessionStorage.getItem(USER_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }


      const res = await api.get("/me");
      sessionStorage.setItem(USER_KEY, JSON.stringify({
        data: res.data.user,
        timestamp: Date.now()
      }));
      return res.data.user;
    } catch {
      return null;
    }
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch {

    }
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

export default api;

