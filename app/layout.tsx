import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MHS \'91 Most Wanted — Class of 1991 Reunion Outreach',
  description:
    'Help us find every classmate before the Memorial High School Class of 1991 35th Reunion on November 14, 2026. Submit contact info or report a passing.',
  keywords: ['Memorial High School', 'MHS 1991', 'Class Reunion', 'Houston', '35th Reunion'],
  openGraph: {
    title: "MHS '91 Most Wanted",
    description: "Help us find every classmate before our 35th reunion.",
    siteName: 'MHS 1991',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
