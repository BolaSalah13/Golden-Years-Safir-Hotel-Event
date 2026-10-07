import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { LogoMark, PageBackground } from "@/components/Logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const eventName =
  process.env.NEXT_PUBLIC_EVENT_NAME ?? "Golden Years Safir Hotel Event";

export const metadata: Metadata = {
  title: {
    default: `${eventName} — Registration & QR Check-in`,
    template: `%s | ${eventName}`,
  },
  description:
    "Register for the event, get a QR ticket, and check in in seconds. Built with Next.js + Firebase.",
  icons: {
    icon: "/logo-circular.png",
  },
};

function Navbar() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark />
          <span className="text-sm sm:text-base">{eventName}</span>
        </Link>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageBackground />
        <div className="relative z-10">
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] w-full max-w-5xl px-4 py-8">
          {children}
        </main>
        <footer className="no-print border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-slate-500">
            <p>Free-tier stack: Next.js on Vercel + Firebase Firestore. QR tickets
            contain only the attendee ID.</p>
            <p className="mt-1 font-medium text-slate-600" dir="auto">
              Developed by Bola Salah | تم التطوير بواسطة بولا صلاح
            </p>
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}
