import type { Metadata } from "next";
import { Inter, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable:'--font-sans',
  subsets:['latin']
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["400", "800", "900"]
});

export const metadata: Metadata = {
  title: "Sci.Port",
  description: "IT Support Ticket Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode;}) {
  console.log("root layout!")
  return (
    <html
      lang="en"
      className={cn("antialiased", inter.variable, redHatDisplay.variable)}
    >
      <body className="flex flex-col min-h-screen bg-[#F8F8F8]">
        {children}
      </body>
    </html>
  );
}
