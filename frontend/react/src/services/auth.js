// src/services/auth.js
import api from "../lib/api";

export const register = (payload) => api.post("/auth/register", payload);

export const login = (username, password) =>
  api.post("/auth/login", { username, password });
