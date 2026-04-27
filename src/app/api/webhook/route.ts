import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK:", body.type);

    if (body.type === "subscription.active") {
      console.log("SUB ACTIVE HIT");

      // ⚠️ TEMP: your user id
      const USER_ID = "f0ac0e19-91ec-41fd-9b76-cf528f693a4a";

      // ✅ create supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // ✅ update user plan
      const { error } = await supabase
        .from("users")
        .update({ plan: "pro" })
        .eq("id", USER_ID);

      if (error) {
        console.error("DB ERROR:", error);
        throw error;
      }

      console.log("USER UPGRADED");
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return new Response("error", { status: 500 });
  }
}