export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function bypassCheckoutEnabled() {
  return process.env.DEV_BYPASS_CHECKOUT === "1";
}

export function openaiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}
