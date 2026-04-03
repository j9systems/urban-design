import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Urban Design Solar — Sales Pipeline",
  description: "Sales pipeline management for Urban Design Solar, Plumbing & Electrical",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-50">
        <Sidebar />
        <main className="lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
