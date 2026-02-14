import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import OrbBackground from '@/components/interactive/OrbBackground'
import { cn } from '@/lib/helpers'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-transparent")}>
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <OrbBackground />
        </div>
        {children}
      </body>
    </html>
  )
}
