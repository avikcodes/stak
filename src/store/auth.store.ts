import { create } from "zustand";

export type AuthStatus = "anonymous" | "authenticated" | "loading";

export type AuthUser = Readonly<{
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: "owner" | "member" | "admin";
}>;

export type AuthState = Readonly<{
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
}>;

export type AuthActions = Readonly<{
  setAuthState: (state: Partial<AuthState>) => void;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setToken: (token: string | null) => void;
  resetAuth: () => void;
}>;

export type AuthStore = AuthState & AuthActions;

export const initialAuthState: AuthState = {
  status: "anonymous",
  user: null,
  token: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialAuthState,
  setAuthState: (state) => set(state),
  setUser: (user) =>
    set({
      user,
      status: user ? "authenticated" : "anonymous",
    }),
  setStatus: (status) => set({ status }),
  setToken: (token) => set({ token }),
  resetAuth: () => set(initialAuthState),
}));
