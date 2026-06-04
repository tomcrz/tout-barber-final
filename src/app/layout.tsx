import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TCUT — Barbier Epagny',
  description: 'Réservez votre coupe en ligne. Barbier à Epagny, Haute-Savoie.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
