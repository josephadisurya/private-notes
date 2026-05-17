import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-satoshi font-[450] special-t tracking-wider">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
