import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoSchool - Online Driving School',
  description: 'Online platform for driving education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" data-theme="light">
      <body className="min-h-screen bg-base-100">
        {children}
      </body>
    </html>
  )
}
