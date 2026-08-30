import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({ variable: '--font-instrument-sans', subsets: ['latin'] });
const plexMono = IBM_Plex_Mono({ variable: '--font-plex-mono', subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Mutation Testing en Ruby: ¿vale la pena?',
  description: 'Una experiencia interactiva sobre Mutation Testing en Ruby, Mutant y metacódigo.',
  openGraph: { title: 'Mutation Testing en Ruby: ¿vale la pena?', description: 'Una experiencia interactiva sobre Mutation Testing en Ruby, Mutant y metacódigo.', images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title: 'Mutation Testing en Ruby: ¿vale la pena?', description: 'Una experiencia interactiva sobre Mutation Testing en Ruby, Mutant y metacódigo.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body className={`${instrumentSans.variable} ${plexMono.variable}`}>{children}</body></html>; }
