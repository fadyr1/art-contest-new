import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
 
// load Cairo from Google Fonts
 
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
      <body  >{children}</body>
    </html>
  )
}
