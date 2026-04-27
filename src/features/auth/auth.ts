import { supabase } from "@/lib/supabase";

type AuthResult = {
  user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null;
  session?: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null;
  error: Error | null;
};

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  await fetch("/api/auth/session", {
    method: "DELETE",
  });

  return {
    user: null,
    session: null,
    error,
  };
}

export async function getCurrentUser(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.getUser();

  return {
    user: data.user,
    session: null,
    error,
  };
}
