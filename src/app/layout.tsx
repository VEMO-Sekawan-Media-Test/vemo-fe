import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VEMO",
  description: "Vehicle monitoring and booking system for mining company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SidebarProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
