import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/app-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SnackbarHost } from "@/components/ui/snackbar";

// Poppins is the main UI typeface; exposed as --font-sans for Tailwind's font-sans
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cradle Match — Operations Console",
  description: "Match, track, and manage startups, mentors, programmes, and partners in one place",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${geistMono.variable} h-full`}>
      <body className="h-full bg-background">
        <TooltipProvider>
          <AppLayout>{children}</AppLayout>
        </TooltipProvider>
        <SnackbarHost />
      </body>
    </html>
  );
}
