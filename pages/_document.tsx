import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
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
      <Html>
        <Head>
          <style>{`
            @font-face {
              font-family: 'Crozet-Regular';
              src: url('/fonts/Crozet-Regular.woff2') format('woff2'),
                   url('/fonts/Crozet-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
