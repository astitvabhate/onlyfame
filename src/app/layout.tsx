import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ServiceWorkerReset } from "@/components/ServiceWorkerReset";

const sans = Manrope({
    subsets: ["latin"],
    variable: "--font-sans",
});

const serif = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
    weight: ["600", "700"],
});

export const metadata: Metadata = {
    title: "ONLYFAME | Premium casting workflows for actors and casting teams",
    description:
        "ONLYFAME brings structure, trust, and polished audition workflows to modern casting teams and working actors.",
    keywords: [
        "casting platform",
        "actors",
        "casting directors",
        "auditions",
        "talent discovery",
        "Indian entertainment",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${sans.variable} ${serif.variable}`}>
            <body className="font-[var(--font-sans)] film-grain">
                <ServiceWorkerReset />
                {children}
            </body>
        </html>
    );
}
