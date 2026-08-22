import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Try-On | AI Virtual Fitting Room',
  description: 'AI-powered virtual try-on for clothes and glasses. See yourself in real-time using MediaPipe pose and face detection.',
  keywords: 'virtual try-on, AR fashion, AI fitting room, glasses try-on, clothes try-on',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
