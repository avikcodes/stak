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

  console.log("USER ID:", user.id);

  const { data, error } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("PLAN LOOKUP ERROR:", error);
  }

  const plan = data?.plan ?? "free";

  console.log("PLAN:", plan);

  if (plan !== "pro") {
    redirect("/paywall");
  }

  return <>{children}</>;
}
