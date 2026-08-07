import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Foster A Wag — Connect Rescues with Foster Families',
  description: 'Find a foster home for your rescue animal, or discover a pet who needs your love.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-amber-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
