import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16">Loading…</p>}>
      <AdminLoginForm />
    </Suspense>
  );
}
