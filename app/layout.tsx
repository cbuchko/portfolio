import type { Metadata } from "next"
import { Source_Sans_3, Poppins } from "next/font/google"
import "./globals.css"

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Choose the weights you need
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Connor Buchko",
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
        className={`my-8 mx-auto px-8 md:px-0 max-w-[900px] ${sourceSansPro.className} ${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
