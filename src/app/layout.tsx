import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import OrbBackground from '@/components/interactive/OrbBackground'
import { cn } from '@/lib/helpers'
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] })

import { ThemeProvider } from '@/components/ThemeProvider'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Orbit',
  description: 'A place to vibe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground antialiased transition-colors duration-300")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <OrbBackground />
          </div>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
