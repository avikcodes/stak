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
  const accessToken = cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE_NAME)?.value;

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

  // 🔥 DEBUG LOGS
  console.log("AUTH USER ID:", user.id);

  // 🔥 SAFE QUERY (no .single)
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id);

  if (error) {
    console.error("PLAN LOOKUP ERROR:", error);
  }

  console.log("DB DATA:", data);

  const plan = data?.[0]?.plan;

  console.log("FINAL PLAN:", plan);

  // 🔥 HANDLE STATES PROPERLY
  if (!plan) {
    console.log("PLAN NOT FOUND → showing loading");
    return <div>Loading...</div>;
  }

  if (plan === "pro") {
    console.log("ACCESS GRANTED");
    return <>{children}</>;
  }

  console.log("ACCESS DENIED → redirecting");
  redirect("/paywall");
}