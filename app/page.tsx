"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Ticket,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ATTENDEES_COLLECTION } from "@/lib/types";
import { LogoBanner } from "@/components/Logo";
import { cn } from "@/lib/utils";

const EVENT_NAME =
  process.env.NEXT_PUBLIC_EVENT_NAME ?? "Golden Years Safir Hotel Event";
const EVENT_DATE =
  process.env.NEXT_PUBLIC_EVENT_DATE ?? "Tuesday, October 13";
const EVENT_VENUE =
  process.env.NEXT_PUBLIC_EVENT_VENUE ?? "Safir Hotel";

const BRANCHES = [
  "مصر الجديدة",
  "المهندسين",
  "شرق القاهرة",
  "التجمع الجديد",
  "امبابة و الوراق و الكيت كات",
  "6 أكتوبر/ مدينة زايد وشماليات أكتوبر",
  "مدينه نصر",
  "مدينتي / الرحاب",
  "المعادي",
  "حدائق أكتوبر و حدائق الأهرام",
  "الشروق و المستقبل",
  "فيصل و الهرم",
  "الاسكندرية",
  "المنصورة",
];

interface FormState {
  name: string;
  phone: string;
  age: string;
  organization: string;
}

const initialForm: FormState = {
  name: "",
  phone: "",
  age: "",
  organization: "",
};

const ARABIC_LETTER = /[\u0621-\u064A\u0670-\u06D3\u06FA-\u06FC]/;

/** Normalize a phone to digits only, mapping +20/0020/20 to leading 0. */
function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0020")) d = "0" + d.slice(4);
  else if (d.startsWith("20") && d.length === 12) d = "0" + d.slice(2);
  return d;
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const name = form.name.trim();
  if (name.length < 2) {
    errors.name = "Please enter your full name.";
  } else if (
    !ARABIC_LETTER.test(name) ||
    /[A-Za-z0-9٠-٩۰-۹]/.test(name)
  ) {
    errors.name =
      "Please write your name in Arabic only (اكتب اسمك بالعربي فقط).";
  }
  const phoneRaw = form.phone.trim();
  if (/[٠-٩۰-۹]/.test(phoneRaw)) {
    errors.phone =
      "Please use English digits for the phone number (اكتب الرقم بأرقام إنجليزية).";
  } else if (!/^01\d{9}$/.test(normalizePhone(phoneRaw))) {
    errors.phone =
      "Please enter a valid 11-digit Egyptian mobile number (01xxxxxxxxx).";
  }
  const ageRaw = form.age.trim();
  if (/[٠-٩۰-۹]/.test(ageRaw)) {
    errors.age =
      "Please use English digits for age (اكتب السن بأرقام إنجليزية).";
  } else if (
    !/^\d{1,3}$/.test(ageRaw) ||
    Number(ageRaw) < 1 ||
    Number(ageRaw) > 120
  ) {
    errors.age = "Please enter a valid age (1–120).";
  }
  if (!BRANCHES.includes(form.organization.trim()))
    errors.organization = "Please choose your branch from the list.";
  return errors;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "error"; message: string; existingId?: string }
  >({ kind: "idle" });

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;

    setStatus({ kind: "submitting" });

    const name = form.name.trim();
    // Normalized: digits only, +20/0020/20 → leading 0 (e.g. 010xxxxxxxx).
    const phone = normalizePhone(form.phone);
    const age = Number(form.age.trim());
    const organization = form.organization.trim();

    try {
      if (!navigator.onLine) {
        throw new Error(
          "You appear to be offline. Reconnect and try again — registrations require a connection to Firestore."
        );
      }

      const col = collection(db, ATTENDEES_COLLECTION);

      // No duplicate phone numbers: one registration per phone.
      const dup = await getDocs(
        query(col, where("phone", "==", phone), limit(1))
      );
      if (!dup.empty) {
        const existingId = dup.docs[0].id;
        setStatus({
          kind: "error",
          message:
            "This phone number is already registered. You can open the existing ticket below.",
          existingId,
        });
        return;
      }

      // Generate a unique attendeeId (Firestore doc ID) and store it in `id`.
      const ref = doc(col);
      await setDoc(ref, {
        id: ref.id,
        name,
        email: "",
        phone,
        age,
        organization,
        checkedIn: false,
        checkedInAt: null,
        createdAt: serverTimestamp(),
      });

      router.push(`/ticket/${ref.id}`);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      // Map common Firestore errors to friendly text.
      const friendly = /permission-denied/i.test(message)
        ? "Firestore denied the write. Check your firestore.rules allow creating attendees, or enable the correct security rules."
        : /Failed to get document|unavailable|network/i.test(message)
          ? "Network error reaching Firestore. Check your connection and Firebase config, then retry."
          : message;
      setStatus({ kind: "error", message: friendly });
    }
  }

  const submitting = status.kind === "submitting";

  return (
    <div className="grid gap-8 md:grid-cols-5">
      {/* Event hero */}
      <section className="md:col-span-2">
        <div className="overflow-hidden rounded-2xl bg-[#0a3f45] text-white shadow-card">
          <div className="bg-gradient-to-br from-[#0e6e77] via-[#0d5c63] to-[#083338] p-6">
            <LogoBanner className="mb-4" />
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e3b34e]">
              <Ticket className="h-4 w-4" /> Free Registration
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight">
              {EVENT_NAME}
            </h1>
            <div className="mt-4 space-y-2 text-sm text-white/90">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> {EVENT_DATE}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {EVENT_VENUE}
              </p>
            </div>
          </div>
          <div className="space-y-3 p-6 text-sm leading-relaxed text-slate-300">
            <p className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Register in seconds — your QR ticket is generated instantly.
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Show the QR at the door for lightning-fast check-in.
            </p>
            <p className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              One registration per phone number.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="md:col-span-3">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
        >
          <h2 className="text-xl font-semibold">Register your spot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fields marked * are required. Your ticket QR is issued immediately
            after registration.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name (الاسم بالعربي) *
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="بولا صلاح فتحي"
                dir="auto"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2",
                  errors.name
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                )}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
              {!errors.name && (
                <p className="mt-1 text-xs text-slate-400">
                  Arabic only — English letters are not accepted (بالعربي فقط)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number (01xxxxxxxxx) *
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                dir="ltr"
                placeholder="01*********"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2",
                  errors.phone
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
              {!errors.phone && (
                <p className="mt-1 text-xs text-slate-400">
                  English digits only (أرقام إنجليزية فقط)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="age" className="text-sm font-medium">
                Age (السن) *
              </label>
              <input
                id="age"
                type="text"
                inputMode="numeric"
                dir="ltr"
                autoComplete="off"
                placeholder="60"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2",
                  errors.age
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                )}
              />
              {errors.age && (
                <p className="mt-1 text-xs text-red-600">{errors.age}</p>
              )}
              {!errors.age && (
                <p className="mt-1 text-xs text-slate-400">
                  English digits only (أرقام إنجليزية فقط)
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Area (المنطقة) *
              </label>
              <select
                id="organization"
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
                className={cn(
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2",
                  errors.organization
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200",
                  !form.organization && "text-slate-400"
                )}
              >
                <option value="" disabled>
                  اختار المنطقة…
                </option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.organization && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.organization}
                </p>
              )}
            </div>
          </div>

          {status.kind === "error" && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{status.message}</p>
                {status.existingId && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/ticket/${status.existingId}`)
                    }
                    className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                  >
                    Open my existing ticket
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Registering…" : "Get my QR ticket"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            By registering you agree to be checked in via QR at the venue.
          </p>
        </form>
      </section>
    </div>
  );
}
