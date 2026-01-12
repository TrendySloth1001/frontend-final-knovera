import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";

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
    <html lang="en" className="h-full">
      <body className="h-full bg-black overflow-hidden">
        <NotificationProvider>
          <AuthProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
