import Head from 'next/head'

function notfound(props) {
  return (
    <>
      <Head>
      <title>404</title>
        <meta itemprop="name" content="404" />
        <meta name="twitter:title" content="404" />
        <meta property="og:title" content="404" />
        <meta property="og:site_name" content="404" />
        <meta name="description" content="Apps designed by Joseph Adisurya" />
        <meta property="og:description" content="Apps designed by Joseph Adisurya" />
        <meta property="twitter:description" content="Apps designed by Joseph Adisurya" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:image" content="/images/thumb.jpg" />
        <meta name="twitter:image" content="/images/thumb.jpg" /> 

        <link rel="apple-touch-icon" sizes="57x57" href="../favicon/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="../favicon/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="../favicon/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="../favicon/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="../favicon/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="../favicon/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="../favicon/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="../favicon/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="../favicon/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="../favicon/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png" />
        <link rel="manifest" href="../favicon/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="../favicon/ms-icon-144x144.png" />
        <meta name="theme-color" content="#FFFFFF"/>
      </Head>
      <div className="w-full flex flex-col items-center">

      <div className="w-full items-center justify-start text-center mt-8 text-md flex-initial flex-col ">

        Page not found. Go <a href="/" className="underline inline-block">home</a>

</div>
</div>

    </>
  );
}

export default notfound;
