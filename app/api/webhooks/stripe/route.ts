import { getStripe } from "@/lib/stripe";
import { markPaid, runInvestigation } from "@/lib/investigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const caseId = session.metadata?.caseId;
    if (caseId) {
      await markPaid(caseId, {
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      });
      try {
        await runInvestigation(caseId);
      } catch (error) {
        await prisma.case.update({
          where: { id: caseId },
          data: {
            status: "NEEDS REVIEW",
            reviewerNotes: `Investigation error: ${error instanceof Error ? error.message : "unknown"}`,
          },
        });
      }
    }
  }

  return Response.json({ received: true });
}
