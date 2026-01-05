import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Knovera - Education Platform",
  description: "Sign in with Google to access the education platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
