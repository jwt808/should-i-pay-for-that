import { bypassCheckoutEnabled, stripeConfigured } from "@/lib/env";
import { PRICE_USD } from "@/lib/constants";

export async function GET() {
  return Response.json({
    stripeEnabled: stripeConfigured(),
    bypassEnabled: bypassCheckoutEnabled(),
    price: PRICE_USD,
  });
}
