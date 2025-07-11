import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header/Header";
import { SanityLive } from "@/sanity/lib/live";
import { ChatModalProvider } from "@/components/chat/ChatModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Connect",
  description: "Campus Connect: A web app platform to collaborate, connect and achieve academic goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ChatModalProvider>
            <SidebarProvider>
              <AppSidebar />

              <SidebarInset>
                <Header />
                <div className="flex flex-col">{children}</div>
              </SidebarInset>
            </SidebarProvider>

            <SanityLive />
          </ChatModalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
