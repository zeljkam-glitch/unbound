import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "UNBOUND — Personal Freedom OS",
  description: "Plan what matters. Follow your rhythm. Protect your freedom.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
