import 'styles/index.css'

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '../components/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default MyApp;
