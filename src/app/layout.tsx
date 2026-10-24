import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "UNBOUND · osobni planer / personal planner",
  description: "Napravi mjesta za ono što ti je važno. Make room for what matters.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
