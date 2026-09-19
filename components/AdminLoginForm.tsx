"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto max-w-sm space-y-4 px-4 py-16"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const json = await res.json();
        setBusy(false);
        if (!res.ok) {
          setError(json.error || "Login failed");
          return;
        }
        router.push(params.get("next") || "/admin");
        router.refresh();
      }}
    >
      <h1 className="font-serif text-3xl text-[var(--navy)]">Reviewer sign in</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-[var(--rule)] px-3 py-2"
        placeholder="Admin password"
      />
      {error && <p className="text-sm text-[var(--flag)]">{error}</p>}
      <button
        className="rounded-full bg-[var(--navy)] px-5 py-2 text-white disabled:opacity-50"
        disabled={busy}
      >
        Sign in
      </button>
    </form>
  );
}
