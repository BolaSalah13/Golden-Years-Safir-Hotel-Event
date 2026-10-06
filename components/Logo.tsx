"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Brand logos (Golden Years).
 * Save the provided images as:
 *   public/logo-circular.png   — the square/circular stamp (navbar, ticket, favicon)
 *   public/logo-horizontal.png — the wide banner (registration hero)
 * Each component gracefully falls back if its file is missing.
 */

export function LogoMark({ className }: { className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <span className={cn("grid h-8 w-8 place-items-center rounded-full bg-[#0d5c63] text-[#e3b34e]", className)}>
        <QrCode className="h-4 w-4" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-circular.png"
      alt="Golden Years logo"
      onError={() => setMissing(true)}
      className={cn("h-8 w-8 rounded-full bg-[#0d5c63] object-cover", className)}
    />
  );
}

export function LogoBanner({ className }: { className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-horizontal.png"
      alt="Golden Years — مؤسسة جولدن ييرز للتنمية المجتمعية"
      onError={() => setMissing(true)}
      className={cn("h-auto w-full rounded-xl object-cover", className)}
    />
  );
}

/**
 * Full-page watermark: the circular stamp, large, centered and faint
 * behind all content. Renders nothing until /logo-circular.png exists.
 */
export function PageBackground() {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-circular.png"
        alt=""
        onError={() => setMissing(true)}
        className="absolute left-1/2 top-1/2 h-[min(92vmin,760px)] w-[min(92vmin,760px)] -translate-x-1/2 -translate-y-1/2 select-none rounded-full object-cover opacity-[0.08]"
      />
    </div>
  );
}
