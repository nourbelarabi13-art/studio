
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { LanguageProvider } from "@/lib/i18n/context";
import { CelestialThemeProvider } from "@/lib/theme-context";
import { StarryNightEffect } from "@/components/starry-night-effect";

export const metadata: Metadata = {
  metadataBase: new URL('https://rosaline-bela.netlify.app'),
  title: 'Rosaline Bela | A Dreamy Sanctuary for Readers & Writers',
  description: 'An elegant and comfortable space for crafting and discovering soft fantasy chronicles. Join the global archive of soft fantasy scribes.',
  keywords: ['storytelling', 'fantasy', 'writing app', 'bilingual', 'arabic literature', 'creative writing', 'Rosaline Bela'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rosaline Bela Sanctuary',
    description: 'A midnight sanctuary where shadows turn to ink and every whisper becomes a myth.',
    type: 'website',
    url: 'https://rosaline-bela.netlify.app',
    siteName: 'Rosaline Bela',
    images: [
      {
        url: 'https://picsum.photos/seed/rosaline/1200/630',
        width: 1200,
        height: 630,
        alt: 'Rosaline Bela Sanctuary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosaline Bela Sanctuary',
    description: 'An elegant and comfortable space for crafting and discovering soft fantasy chronicles.',
    images: ['https://picsum.photos/seed/rosaline/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Alegreya:ital,wght@0,400..900;1,400..900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen relative transition-colors duration-700" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LanguageProvider>
            <CelestialThemeProvider>
              <StarryNightEffect />
              {children}
              <Toaster />
            </CelestialThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
