import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Sthem's and Sabe's Transport Service | Johannesburg Guesthouse & Tours",
  description: 'Premium guesthouse accommodation and shuttle services in Johannesburg. Experience the best of South Africa with our all-inclusive tour packages.',
  keywords: 'Johannesburg guesthouse, airport shuttle, Johannesburg tours, Ukutula, Gold Reef City, South Africa accommodation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
