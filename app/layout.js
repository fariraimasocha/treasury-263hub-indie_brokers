import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import Providers from "@/components/providers";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Treasury Management System ERP",
  description: "Treasury Management System ERP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <QueryProvider>
        <Providers>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Toaster />
            {children}
          </body>
        </Providers>
      </QueryProvider>
    </html>
  );
}
