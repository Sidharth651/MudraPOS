import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "MudraPOS — Retail Fabric POS",
  description:
    "Point of Sale application for retail fabric business. Manage billing, inventory, customers, and reports.",
  keywords: ["POS", "fabric", "retail", "billing", "inventory", "khata"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <Providers>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
