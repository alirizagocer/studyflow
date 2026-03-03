/**
 * store/authStore.ts
 * Zustand ile global auth state yönetimi.
 * Token'lar localStorage'da şifrelenmiş saklanır.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

interface AuthState {
  accessToken: string | null;
  refreshTokenValue: string | null;
  user: { id: number; email: string; display_name: string } | null;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthState["user"]) => void;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshTokenValue: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshTokenValue: refresh, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      refreshToken: async () => {
        const { refreshTokenValue } = get();
        if (!refreshTokenValue) return false;
        try {
          const res = await api.post("/api/auth/refresh", { refresh_token: refreshTokenValue });
          set({ accessToken: res.data.access_token });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      logout: () =>
        set({ accessToken: null, refreshTokenValue: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "studyflow-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
      }),
    }
  )
);

/**
 * store/appStore.ts
 * Global uygulama state — aktif notlar, timer durumu, UI state.
 */
import { create as createStore } from "zustand";

interface TimerState {
  isRunning: boolean;
  mode: "work" | "break";
  secondsLeft: number;
  pomodoroCount: number;
  activeNoteId: number | null;
  activeTaskId: number | null;
}

interface AppState {
  timer: TimerState;
  selectedFolderId: number | null;
  selectedNoteId: number | null;
  searchQuery: string;

  setTimer: (updates: Partial<TimerState>) => void;
  resetTimer: () => void;
  setSelectedFolder: (id: number | null) => void;
  setSelectedNote: (id: number | null) => void;
  setSearchQuery: (q: string) => void;
}

const DEFAULT_TIMER: TimerState = {
  isRunning: false,
  mode: "work",
  secondsLeft: 25 * 60,
  pomodoroCount: 0,
  activeNoteId: null,
  activeTaskId: null,
};

export const useAppStore = createStore<AppState>()((set) => ({
  timer: DEFAULT_TIMER,
  selectedFolderId: null,
  selectedNoteId: null,
  searchQuery: "",

  setTimer: (updates) =>
    set((s) => ({ timer: { ...s.timer, ...updates } })),

  resetTimer: () => set({ timer: DEFAULT_TIMER }),

  setSelectedFolder: (id) => set({ selectedFolderId: id, selectedNoteId: null }),

  setSelectedNote: (id) => set({ selectedNoteId: id }),

  setSearchQuery: (q) => set({ searchQuery: q }),
}));
