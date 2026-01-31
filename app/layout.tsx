import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'AI Interview Practice',
  description: 'Practice coding interviews with AI-powered feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-gray-900 ${spaceGrotesk.variable}`}>
      <body className={`bg-gray-900 font-sans ${spaceGrotesk.className}`}>{children}</body>
    </html>
  );
}

