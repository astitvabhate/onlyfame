import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ONLYFAME - Casting & Talent Discovery Platform",
    description: "Connect with verified casting directors and discover your next big role. Structured auditions, transparent process, merit-driven casting.",
    keywords: ["casting", "actors", "auditions", "talent", "entertainment", "bollywood", "casting calls"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
