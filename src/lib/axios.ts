"use client";
import axios from "axios";

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default api;
