import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    <html lang="en" className="h-full" suppressHydrationWarning data-theme="dark">
      <head>
        {/* Prevent flash of wrong theme on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('knovera-theme');if(t)document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className="h-full bg-black overflow-hidden">
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
