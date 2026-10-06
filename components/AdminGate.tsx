"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "";
const STORAGE_KEY = "event-admin-auth";

/**
 * Optional lightweight passcode gate for /admin/* pages.
 * If NEXT_PUBLIC_ADMIN_CODE is empty, the gate is disabled (open access).
 * For real access control use Firebase Auth + firestore.rules instead.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!ADMIN_CODE);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ADMIN_CODE) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setReady(true);
    } catch {
      // ignore
    }
  }, []);

  if (!ADMIN_CODE || ready) return <>{children}</>;

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <ShieldAlert className="h-8 w-8 text-slate-900" />
      <h1 className="mt-2 text-lg font-semibold">Admin access</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter the event manager passcode to open the scanner & dashboard.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (code === ADMIN_CODE) {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {}
            setReady(true);
          } else {
            setError("Incorrect passcode.");
          }
        }}
      >
        <input
          type="password"
          inputMode="numeric"
          placeholder="Passcode"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Unlock admin
        </button>
      </form>
    </div>
  );
}
