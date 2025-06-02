import type { Metadata } from "next";
import "../../globals.css";
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import type { Viewport } from 'next'

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Search - Soniic",
  description: "Search for music across Spotify, Apple Music, Tidal and more platforms.",
  twitter: {
    site: "@MathesonStep",
    card: "summary_large_image"
  },
  icons: {
    icon: '/soniic.png',
  },
}

export const viewport: Viewport = {
  themeColor: 'black',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          {children}
          {/* No footer for search page */}
        </ThemeProvider>
      </body>
    </html>
  );
}
