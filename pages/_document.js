import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        {/* Preloaded (unlike Spectral, self-hosted fonts don't start
            downloading until their @font-face is actually needed) so
            picking OpenDyslexic doesn't flash the sans-serif fallback
            while the file fetches. */}
        <link rel="preload" href="/font/OpenDyslexic-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/font/OpenDyslexic-Bold.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/font/OpenDyslexic-Italic.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/font/OpenDyslexic-BoldItalic.woff" as="font" type="font/woff" crossOrigin="anonymous" />
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
      <body className="bg-white dark:bg-neutral-900 beige:bg-[#f8efdb] text-gray-900 dark:text-white beige:text-[#463a25] font-satoshi font-[450] special-t tracking-wider">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
