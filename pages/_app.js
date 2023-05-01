import '@/styles/globals.css'

import React, { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  // use effect pulls body class name from pageProps
  useEffect(() => {
    document.body.className = pageProps.bodyClass;
  });

  return <Component {...pageProps} />
}
