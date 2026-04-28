import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // check if exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "User already exists" });
    }

    // insert new user
    const { error } = await supabase.from("users").insert({
      id: userId,
      plan: "free",
    });

    if (error) {
      console.error("INSERT ERROR:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log("USER CREATED:", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}