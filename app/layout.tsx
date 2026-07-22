import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZILLY — The Night Never Ends',
  description: 'An immersive cinematic reservation journey for ZILLY, a luxury seaside nightclub.',
};

export const viewport: Viewport = { themeColor: '#030303', width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
