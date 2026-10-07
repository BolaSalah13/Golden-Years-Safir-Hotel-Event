"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const LEGACY_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "";

/** Passcode for scanner pages (/scan, /admin/scan). Falls back to legacy code. */
export function scannerCode(): string {
  return process.env.NEXT_PUBLIC_SCANNER_CODE ?? LEGACY_CODE ?? "";
}

/** Passcode for the dashboard (/admin/dashboard). Falls back to legacy code. */
export function dashboardCode(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_CODE ?? LEGACY_CODE ?? "";
}

/**
 * Optional lightweight passcode gate with separate scanner / dashboard roles.
 * If the required code is empty, the gate is disabled (open access).
 * For real access control use Firebase Auth + firestore.rules instead.
 */
export default function AdminGate({
  children,
  code,
  storageKey,
  title,
  description,
  unlockLabel,
}: {
  children: React.ReactNode;
  /** Required passcode; defaults to the legacy NEXT_PUBLIC_ADMIN_CODE. */
  code?: string;
  storageKey?: string;
  title?: string;
  description?: string;
  unlockLabel?: string;
}) {
  const required = code ?? LEGACY_CODE;
  const key = storageKey ?? "event-admin-auth";
  const [ready, setReady] = useState(!required);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!required) return;
    try {
      if (localStorage.getItem(key) === "1") setReady(true);
    } catch {
      // ignore
    }
  }, [required, key]);

  if (!required || ready) return <>{children}</>;

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <ShieldAlert className="h-8 w-8 text-slate-900" />
      <h1 className="mt-2 text-lg font-semibold">{title ?? "Admin access"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {description ?? "Enter the event manager passcode to continue."}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (value === required) {
            try {
              localStorage.setItem(key, "1");
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
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {unlockLabel ?? "Unlock"}
        </button>
      </form>
    </div>
  );
}
