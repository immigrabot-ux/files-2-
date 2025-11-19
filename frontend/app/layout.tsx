import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LectureAI - AI-Powered Lecture Video Generator',
  description: 'Transform slide decks into professional lecture videos with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
