import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "stak-auth";
export const SUPABASE_ACCESS_TOKEN_COOKIE_NAME = "sb-access-token";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "authenticated";
}
