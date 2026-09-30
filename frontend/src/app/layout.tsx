import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import SmoothCursor from "@/components/SmoothCursor";

export const metadata: Metadata = {
  title: "MOAS Tech",
  description: "Computers, laptops and technology products from MOAS Tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SmoothCursor />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
