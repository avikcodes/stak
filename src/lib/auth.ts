import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "stak-auth";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "authenticated";
}
