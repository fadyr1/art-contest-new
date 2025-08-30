import type { AppProps } from "next/app"
import { Tajawal } from "next/font/google"
import "../styles/globals.css"

// load Cairo from Google Fonts
const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "arabic"],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={tajawal.className}>
      <Component {...pageProps} />
    </div>
  )
}