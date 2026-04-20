import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-satoshi font-[450] special-t tracking-wider">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
