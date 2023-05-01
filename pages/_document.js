import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(props) {

  const pageProps = props?.__NEXT_DATA__?.props?.pageProps;

  return (
    <Html lang="en">
      <Head/>
      <body className = {pageProps.bodyClass}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
