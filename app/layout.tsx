import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "LupaShop Admin — Backoffice",
  description: "Painel administrativo da plataforma LupaShop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="bg-background text-foreground antialiased">
        <ApolloWrapper>
          <AdminShell>{children}</AdminShell>
        </ApolloWrapper>
      </body>
    </html>
  );
}
