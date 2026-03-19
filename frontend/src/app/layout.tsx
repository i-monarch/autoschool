import type { Metadata } from 'next'
import './globals.css'
import ToastContainer from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'AutoSchool - Онлайн автошкола',
  description: 'Онлайн-платформа для навчання водінню та підготовки до іспитів ПДР',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" data-theme="autoschool">
      <body className="min-h-screen bg-base-100">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
