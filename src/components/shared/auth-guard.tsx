import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SUPABASE_ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";

type AuthGuardProps = {
  children: ReactNode;
};

export async function AuthGuard({ children }: AuthGuardProps) {
  await connection();

  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const supabase = createServerSupabaseClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    redirect("/login");
  }

  // ✅ DEBUG
  console.log("AUTH USER ID:", user.id);

  // ✅ FIXED QUERY (clean + reliable)
  const { data, error } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("DB ERROR:", error);
    redirect("/paywall");
  }

  console.log("DB DATA:", data);

  const plan = data?.plan;

  console.log("FINAL PLAN:", plan);

  // ❗ IMPORTANT: if no row exists → treat as FREE user
  if (!plan) {
    console.log("NO PLAN → redirecting to paywall");
    redirect("/paywall");
  }

  if (plan === "pro") {
    console.log("ACCESS GRANTED");
    return <>{children}</>;
  }

  console.log("NOT PRO → redirecting");
  redirect("/paywall");
}