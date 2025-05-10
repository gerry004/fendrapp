import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "./lib/session";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Fendr App",
  description: "Fendr App - Hateful Comment Moderation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the initial session server-side
  const session = getServerSession();
  
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider initialUser={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 