import { handlePaymentWebhook } from "@/server/payments/payment-webhook.service";

export const runtime = "nodejs";

function getRemoteIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip")
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        error: "Invalid webhook payload.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    await handlePaymentWebhook({
      payload,
      remoteIp: getRemoteIp(request),
    });

    return Response.json({
      ok: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error.";
    const status =
      message.includes("not allowed") || message.includes("Invalid")
        ? 400
        : 500;

    return Response.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}
