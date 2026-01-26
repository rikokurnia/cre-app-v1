import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const headingFont = localFont({
  src: "../public/fonts/mondwest.woff2",
  variable: "--font-heading",
  weight: "100 900",
});

const bodyFont = localFont({
  src: "../public/fonts/alliance.woff2",
  variable: "--font-body",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Creator Predict Base",
  description: "Predict Farcaster Creators. Build Your Deck. Win Rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
