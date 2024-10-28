import "./globals.css";
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
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
      </ThemeProvider>
      </body>
    </html>
  );
}
