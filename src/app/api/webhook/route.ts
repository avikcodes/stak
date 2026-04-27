export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK:", body.type);

    // ✅ Give access on subscription active
    if (body.type === "subscription.active") {
      console.log("SUB ACTIVE HIT");

      // ⚠️ TEMP: hardcode your user (we’ll fix mapping later)
      const USER_ID = "f0ac0e19-91ec-41fd-9b76-cf528f693a4a";

      // 👉 update your DB (replace with your DB code)
      await fetch("http://localhost:3000/api/debug-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          plan: "pro",
        }),
      });

      console.log("USER UPGRADED");
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return new Response("error", { status: 500 });
  }
}