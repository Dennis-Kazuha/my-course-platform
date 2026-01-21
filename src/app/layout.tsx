import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MVP Course Platform',
  description: 'AI-Powered Learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}