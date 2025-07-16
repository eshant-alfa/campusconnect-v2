import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Connect Admin Panel",
  description: "Campus Connect Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
