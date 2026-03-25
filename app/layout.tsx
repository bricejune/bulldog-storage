import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bulldog Storage — Yale's Most Careful Student Storage",
  description:
    "Yale's most careful student storage service. We cap our bookings so your stuff always gets the attention it deserves. Pickup, storage, and return — done.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
