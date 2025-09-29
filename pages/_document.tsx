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
        <body className="bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
