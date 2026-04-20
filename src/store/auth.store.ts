import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

export type AuthStatus = "anonymous" | "authenticated" | "loading";

export type AuthUser = User;

export type AuthSession = Session;

export type AuthState = Readonly<{
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  token: string | null;
  isActive: boolean;
}>;

export type AuthActions = Readonly<{
  setAuthState: (state: Partial<AuthState>) => void;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setStatus: (status: AuthStatus) => void;
  setToken: (token: string | null) => void;
  setIsActive: (isActive: boolean) => void;
  resetAuth: () => void;
}>;

export type AuthStore = AuthState & AuthActions;

export const initialAuthState: AuthState = {
  status: "anonymous",
  user: null,
  session: null,
  token: null,
  isActive: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialAuthState,
  setAuthState: (state) => set(state),
  setUser: (user) =>
    set((state) => ({
      user,
      status: user ? "authenticated" : "anonymous",
      session: user ? state.session : null,
      token: user ? state.token : null,
    })),
  setSession: (session) =>
    set({
      session,
      status: session ? "authenticated" : "anonymous",
      user: session?.user ?? null,
      token: session?.access_token ?? null,
    }),
  setStatus: (status) => set({ status }),
  setToken: (token) => set({ token }),
  setIsActive: (isActive) => set({ isActive }),
  resetAuth: () => set(initialAuthState),
}));
