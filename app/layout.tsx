import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="bg-gray-900">
      <body className="bg-gray-900">{children}</body>
    </html>
  );
}

