'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Car, LogOut, User, BookOpen, ClipboardCheck, MessageCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, fetchMe, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-8">
        <div className="flex-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-content" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">AutoSchool</span>
          </Link>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-sm">
                    {user.first_name?.[0] || user.username[0]}
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline text-sm">
                {user.first_name || user.username}
              </span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 z-50 border border-base-200">
              <li>
                <Link href="/profile">
                  <User className="w-4 h-4" />
                  Профіль
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut className="w-4 h-4" />
                  Вийти
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="btm-nav lg:hidden border-t border-base-200">
        <Link href="/dashboard" className="text-primary">
          <Home className="w-5 h-5" />
          <span className="btm-nav-label text-xs">Головна</span>
        </Link>
        <Link href="/courses">
          <BookOpen className="w-5 h-5" />
          <span className="btm-nav-label text-xs">Курси</span>
        </Link>
        <Link href="/tests">
          <ClipboardCheck className="w-5 h-5" />
          <span className="btm-nav-label text-xs">Тести</span>
        </Link>
        <Link href="/chat">
          <MessageCircle className="w-5 h-5" />
          <span className="btm-nav-label text-xs">Чат</span>
        </Link>
        <Link href="/profile">
          <User className="w-5 h-5" />
          <span className="btm-nav-label text-xs">Профіль</span>
        </Link>
      </nav>
    </div>
  )
}
