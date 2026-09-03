import type { Metadata } from 'next';
import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fonte-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-mono',
  display: 'swap',
});

/**
 * A direção visual pedia uma serifa japonesa (mincho). Fontes CJK são
 * fatiadas pelo Google em ~120 blocos de unicode-range mesmo pedindo só o
 * subset latino, e o next/font dá preload em todos: eram 3.775 KB de fonte
 * no primeiro paint, para desenhar preço e título. Bodoni Moda entrega o
 * mesmo caráter de selo impresso — contraste extremo, ar editorial — em
 * dois arquivos latinos.
 */
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--fonte-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Precificadora 3D · Dojo Panda',
  description: 'Descubra quanto cobrar pela sua peça impressa em 3D.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
