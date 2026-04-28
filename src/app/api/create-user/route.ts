import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    console.log("CREATE USER HIT:", userId);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { error } = await supabase.from("users").insert({
      id: userId,
      plan: "free",
    });

    if (error) {
      console.error("INSERT ERROR:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
