import type { AppProps } from "next/app"
import { Tajawal } from "next/font/google"
import "../styles/globals.css"
import Head from "next/head"

// load Cairo from Google Fonts
const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "arabic"],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
     <>
      <Head>
        <title>مهرجان الكرازة 2025</title>
        <meta name="description" content="اثبت علي ما تعلمت" />
      </Head>
    <div className={tajawal.className}>
      <Component {...pageProps} />
    </div>
  </>
  )
}