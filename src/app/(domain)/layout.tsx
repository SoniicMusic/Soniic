// import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import '../globals.css';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

// export const metadata: Metadata = {
//   title: "Soniic",
//   description: "Music Marketing Redefined",
//   twitter: {
//     site: "@MathesonStep",
//   }

// };

export default function DomainLayout({
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
