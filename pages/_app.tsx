import 'styles/index.css'

import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '../components/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}

export default MyApp;
