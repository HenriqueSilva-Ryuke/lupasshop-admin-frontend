import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Font might fail if offline
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import { AdminSidebar } from "@/components/AdminSidebar";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LupaShop Admin",
  description: "Backoffice Administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="bg-slate-50 text-slate-900">
        <ApolloWrapper>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ApolloWrapper>
      </body>
    </html>
  );
}
