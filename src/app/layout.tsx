import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golden Starter V2 — Enterprise Monorepo Skeleton",
  description: "Enterprise multi-tenant starter for web and mobile with Codex agent profiles and Spec-Driven Development",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
