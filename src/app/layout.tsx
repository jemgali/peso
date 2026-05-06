import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "./api/uploadthing/core";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PESO - System",
  icons: {
    icon: "/assets/peso_logo.png",
  },
  description: "",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
        {children}
        <Toaster position="top-right" theme="system" closeButton />
      </body>
    </html>
  );
}
