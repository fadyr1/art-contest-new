import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"

// load Cairo from Google Fonts
const cairo = Cairo({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "arabic"],
})

export const metadata: Metadata = {
  title: "مهرجان الكرازة 2025",
  description: "اثبت علي ما تعلمت",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body className={cairo.className}>{children}</body>
    </html>
  )
}
