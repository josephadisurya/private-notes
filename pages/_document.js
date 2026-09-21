import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Writer" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Applies the saved/OS-default theme before first paint, so there's
            no flash of the wrong theme while React hydrates. Keep this in
            sync with lib/theme.js's getInitialTheme(). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("app-writer-theme");if(t!=="light"&&t!=="dark"&&t!=="beige"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;if(t==="dark")r.classList.add("dark");if(t==="beige")r.classList.add("beige");}catch(e){}})();`,
          }}
        />
      </Head>
      <body className="bg-white dark:bg-neutral-900 beige:bg-[#f2e8d5] text-gray-900 dark:text-white font-satoshi font-[450] special-t tracking-wider">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
