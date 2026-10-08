import Link from "next/link";
import { LayoutDashboard, ScanLine } from "lucide-react";
import AdminGate from "@/components/AdminGate";

export const metadata = { title: "Admin" };

export default function AdminIndex() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold">Event admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Scan QR Codes at the door or monitor attendance live.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/scan"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <ScanLine className="h-5 w-5" /> Check-in scanner
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-semibold hover:bg-slate-100"
          >
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
        </div>
      </div>
    </AdminGate>
  );
}
