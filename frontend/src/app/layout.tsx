import type { Metadata } from "next";
import { Poppins, Hind_Siliguri } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import SmoothCursor from "@/components/SmoothCursor";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "/vslogo.png",
    shortcut: "/vslogo.png",
    apple: "/vslogo.png",
  },

  title: "VC Tech",
  description: "Computers, laptops and technology products from VC Tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${hindSiliguri.variable}`}
    >
      <head>
        <link rel="icon" type="image/png" href="/vslogo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/vslogo.png?v=2" />
        <link rel="apple-touch-icon" href="/vslogo.png?v=2" />
      </head>

      <body>
        <CartProvider>
          <SmoothCursor />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
