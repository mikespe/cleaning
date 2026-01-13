import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Garden State Cleaning | The Super-Verified Clean',
  description:
    "Don't let a bad clean delay your CO. Construction cleaning run by a former Super who knows the phases. Rough cleans, final cleans, and everything in between.",
  keywords: [
    'construction cleaning',
    'NJ construction cleaning',
    'rough clean',
    'final clean',
    'post-construction cleaning',
    'New Jersey',
    'Newark',
    'commercial cleaning',
  ],
  authors: [{ name: 'Dave - Garden State Cleaning' }],
  openGraph: {
    title: 'Garden State Cleaning | The Super-Verified Clean',
    description:
      "Construction cleaning run by a former Super who knows the phases. Don't let a bad clean delay your CO.",
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-slate-950 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
