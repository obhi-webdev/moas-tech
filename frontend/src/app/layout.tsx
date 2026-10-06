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
  metadataBase: new URL("https://vctechbd.com"),

  title: {
    default: "VC Tech | Computer, Laptop & Technology Products in Bangladesh",
    template: "%s | VC Tech",
  },

  description:
    "Shop computers, laptops, accessories, gadgets and technology products from VC Tech Bangladesh. Explore latest products, prices and order online.",

  keywords: [
    "VC Tech",
    "VC Tech Bangladesh",
    "computer shop Bangladesh",
    "laptop price in Bangladesh",
    "computer accessories Bangladesh",
    "technology products Bangladesh",
    "gadgets Bangladesh",
    "computer components Bangladesh",
  ],

  authors: [
    {
      name: "VC Tech",
    },
  ],

  creator: "VC Tech",
  publisher: "VC Tech",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "/",
    siteName: "VC Tech",
    title:
      "VC Tech | Computer, Laptop & Technology Products in Bangladesh",
    description:
      "Shop computers, laptops, accessories, gadgets and technology products from VC Tech Bangladesh.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "VC Tech | Computer, Laptop & Technology Products in Bangladesh",
    description:
      "Shop computers, laptops, accessories, gadgets and technology products from VC Tech Bangladesh.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
      <body>
        <CartProvider>
          <SmoothCursor />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
