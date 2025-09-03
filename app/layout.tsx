import type { Metadata } from 'next'
import { Source_Sans_3, IBM_Plex_Mono, Poppins } from 'next/font/google'
import './globals.css'

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose the weights you need
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose the weights you need
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Connor Buchko',
  description: "Connor Buchko's Porfolio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSansPro.className} ${poppins.className} ${ibmPlexMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
