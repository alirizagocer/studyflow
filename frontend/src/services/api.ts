/**
 * services/api.ts
 * Axios HTTP istemcisi — tüm API çağrıları buradan geçer.
 * Interceptor'lar: JWT injection, token refresh, hata yönetimi.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = "http://localhost:8000";

// ── Axios Instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor: JWT Token Ekleme ─────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Hata Yönetimi ──────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      // Token yenileme dene
      const refreshed = await useAuthStore.getState().refreshToken();
      if (refreshed) {
        return api(original);
      }
      // Yenilenemedi — logout
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;

// ── API Fonksiyonları ─────────────────────────────────────────────────────────

// Auth
export const authAPI = {
  register: (data: { email: string; display_name: string; password: string }) =>
    api.post("/api/auth/register", data).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get("/api/auth/me").then((r) => r.data),
};

// Folders
export const folderAPI = {
  list: () => api.get("/api/folders").then((r) => r.data),
  create: (data: { name: string; parent_id?: number | null }) =>
    api.post("/api/folders", data).then((r) => r.data),
  rename: (id: number, name: string) =>
    api.patch(`/api/folders/${id}`, { name }).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/api/folders/${id}`).then((r) => r.data),
};

// Notes
export const noteAPI = {
  list: (folderId: number) =>
    api.get("/api/notes", { params: { folder_id: folderId } }).then((r) => r.data),
  search: (q: string) =>
    api.get("/api/notes/search", { params: { q } }).then((r) => r.data),
  get: (id: number) => api.get(`/api/notes/${id}`).then((r) => r.data),
  create: (data: { title: string; content: string; folder_id: number; tags: string[] }) =>
    api.post("/api/notes", data).then((r) => r.data),
  update: (id: number, data: Partial<{ title: string; content: string; tags: string[] }>) =>
    api.patch(`/api/notes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/notes/${id}`).then((r) => r.data),
};

// Tasks
export const taskAPI = {
  today: () => api.get("/api/tasks/today").then((r) => r.data),
  range: (start: string, end: string) =>
    api.get("/api/tasks", { params: { start, end } }).then((r) => r.data),
  create: (data: object) => api.post("/api/tasks", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/api/tasks/${id}`, data).then((r) => r.data),
  complete: (id: number, actualMinutes = 0) =>
    api.post(`/api/tasks/${id}/complete`, null, { params: { actual_minutes: actualMinutes } }).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/tasks/${id}`).then((r) => r.data),
};

// Sessions
export const sessionAPI = {
  start: (data: { note_id?: number | null; task_id?: number | null }) =>
    api.post("/api/sessions/start", data).then((r) => r.data),
  end: (quickNotes = "") =>
    api.post("/api/sessions/end", { quick_notes: quickNotes }).then((r) => r.data),
};

// Stats
export const statsAPI = {
  weekly: (weekStart: string) =>
    api.get("/api/stats/weekly", { params: { week_start: weekStart } }).then((r) => r.data),
};

// Goals
export const goalAPI = {
  list: () => api.get("/api/goals").then((r) => r.data),
  create: (data: object) => api.post("/api/goals", data).then((r) => r.data),
  badges: () => api.get("/api/goals/badges").then((r) => r.data),
};

// Calendar
export const calendarAPI = {
  getUrl: (token: string) => `${BASE_URL}/api/calendar/${token}/studyflow.ics`,
};
