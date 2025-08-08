import type React from "react"
import type { Metadata } from "next"
import { Poppins, Nunito, Cairo } from "next/font/google"
import "./globals.css"

const poppins = Cairo({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const nunito = Cairo({
   weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Art Contest 2024",
  description: "Celebrating creativity and artistic expression",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${nunito.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
