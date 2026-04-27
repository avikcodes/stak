import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SUPABASE_ACCESS_TOKEN_COOKIE_NAME,
} from "@/lib/auth";

type SessionBody = {
  accessToken?: string;
};

export async function POST(request: Request) {
  const { accessToken }: SessionBody = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 });
  }

  const cookieStore = await cookies();

  cookieStore.set(SUPABASE_ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete(SUPABASE_ACCESS_TOKEN_COOKIE_NAME);
  cookieStore.delete(AUTH_COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
