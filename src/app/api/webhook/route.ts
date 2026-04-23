export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook received:", body);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);

    return new Response("Error", { status: 500 });
  }
}
