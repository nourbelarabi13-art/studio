import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { LanguageProvider } from "@/lib/i18n/context";
import { CelestialThemeProvider } from "@/lib/theme-context";
import { StarryNightEffect } from "@/components/starry-night-effect";

export const metadata: Metadata = {
  title: 'Rosaline Bela | A Dreamy Sanctuary for Readers & Writers',
  description: 'An elegant and comfortable space for crafting and discovering soft fantasy chronicles.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
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
