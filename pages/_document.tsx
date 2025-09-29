import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'

class MyDocument extends Document {
  // If you need to add custom logic to getInitialProps, you can override it here
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preload critical fonts */}
          <link
            rel="preload"
            href="/fonts/Crozet-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/BBBPoppinsTN-TextRegular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/BBBPoppinsTN-DisplayRegular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/poppins/BBBPoppinsTN-DisplayBold.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const theme = localStorage.getItem('theme') ||
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#111827';
                    document.body.style.backgroundColor = '#111827';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.backgroundColor = '#ffffff';
                    document.body.style.backgroundColor = '#ffffff';
                  }
                })();
              `,
            }}
          />
          <style>{`
            html, body {
              background-color: #ffffff;
              transition: none;
            }
            html.dark, html.dark body {
              background-color: #111827;
            }
            @font-face {
              font-family: 'Crozet-Regular';
              src: url('/fonts/Crozet-Regular.woff2') format('woff2'),
                   url('/fonts/Crozet-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Poppins-Text';
              src: url('/fonts/poppins/BBBPoppinsTN-TextRegular.woff2') format('woff2'),
                   url('/fonts/poppins/BBBPoppinsTN-TextRegular.woff') format('woff');
              font-weight: 400;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Poppins-Display';
              src: url('/fonts/poppins/BBBPoppinsTN-DisplayRegular.woff2') format('woff2'),
                   url('/fonts/poppins/BBBPoppinsTN-DisplayRegular.woff') format('woff');
              font-weight: 400;
              font-style: normal;
              font-display: block;
            }
            @font-face {
              font-family: 'Poppins-Display';
              src: url('/fonts/poppins/BBBPoppinsTN-DisplayBold.woff2') format('woff2'),
                   url('/fonts/poppins/BBBPoppinsTN-DisplayBold.woff') format('woff');
              font-weight: 700;
              font-style: normal;
              font-display: block;
            }
          `}</style>
        </Head>
        <body className="bg-white dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
