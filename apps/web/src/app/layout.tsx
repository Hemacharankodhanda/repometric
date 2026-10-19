import React from 'react';
import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RepoMetric: health score and map for any GitHub repo',
  description:
    'Paste a GitHub link. Get a 0-100 health score, a to-do list that fixes it, an interactive map of your code, and an architecture diagram. Free, no sign-up.',
  metadataBase: new URL('https://repometric.dev'),
  openGraph: {
    title: 'RepoMetric: health score and map for any GitHub repo',
    description:
      'Paste a GitHub link. Get a 0-100 health score, a to-do list that fixes it, an interactive map of your code, and an architecture diagram. Free, no sign-up.',
    type: 'website',
  },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('repometric-theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-paper text-ink font-body antialiased selection:bg-lime selection:text-ink overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
