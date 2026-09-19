import { PRICE_CENTS, STRIPE_PRODUCT_NAME } from "@/lib/constants";
import { appUrl, stripeConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string };
  if (!token) return Response.json({ error: "Missing case token." }, { status: 400 });

  const record = await prisma.case.findUnique({ where: { accessToken: token } });
  if (!record) return Response.json({ error: "Case not found." }, { status: 404 });

  if (!stripeConfigured()) {
    return Response.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY or use DEV_BYPASS_CHECKOUT=1.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl()}/case/${record.accessToken}?paid=1`,
    cancel_url: `${appUrl()}/intake?canceled=1`,
    customer_email: record.email || undefined,
    metadata: { caseId: record.id, accessToken: record.accessToken },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: { name: STRIPE_PRODUCT_NAME },
        },
      },
    ],
  });

  await prisma.case.update({
    where: { id: record.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return Response.json({ url: session.url, id: session.id });
}
