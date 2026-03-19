'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Car, LogOut, User, GraduationCap, Calendar,
  Users, FolderOpen, MessageCircle, Bell, ChevronRight, Home,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'

const navItems = [
  { href: '/teacher/dashboard', label: 'Головна', icon: Home },
  { href: '/teacher/schedule', label: 'Розклад', icon: Calendar },
  { href: '/teacher/students', label: 'Учні', icon: Users },
  { href: '/teacher/materials', label: 'Матеріали', icon: FolderOpen },
  { href: '/teacher/chat', label: 'Повідомлення', icon: MessageCircle },
]

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, checked, fetchMe, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (checked && !user) {
      router.push('/login')
    }
    if (checked && user && user.role !== 'teacher' && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [checked, user, router])

  if (!checked || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/teacher/dashboard') return pathname === '/teacher/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base-200/40">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-base-100 border-r border-base-300/60 min-h-screen sticky top-0">
        <div className="p-5 pb-2">
          <Link href="/teacher/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-secondary-content" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">AutoSchool</span>
              <span className="text-xs text-base-content/40 block -mt-0.5">Викладач</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-base-300/60">
          <Link
            href="/teacher/profile"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive('/teacher/profile') ? 'bg-secondary/10 text-secondary' : 'hover:bg-base-200'}
            `}
          >
            <div className="avatar placeholder">
              <div className="bg-secondary text-secondary-content rounded-full w-8">
                <span className="text-xs font-medium">
                  {user.first_name?.[0] || user.username[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
              </p>
              <p className="text-xs text-base-content/50 truncate">{user.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-base-content/30 flex-shrink-0" />
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/60">
          <div className="flex items-center h-16 px-4 lg:px-6">
            <Link href="/teacher/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-secondary-content" />
              </div>
              <span className="text-lg font-bold">AutoSchool</span>
            </Link>

            <div className="hidden lg:block flex-1" />

            <div className="ml-auto flex items-center gap-1">
              <button className="btn btn-ghost btn-sm btn-circle">
                <Bell className="w-5 h-5 text-base-content/60" />
              </button>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2 pl-2 pr-3">
                  <div className="avatar placeholder">
                    <div className="bg-secondary text-secondary-content rounded-full w-7">
                      <span className="text-xs">{user.first_name?.[0] || user.username[0]}</span>
                    </div>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.first_name || user.username}
                  </span>
                </div>
                <ul tabIndex={0} className="dropdown-content menu p-1.5 shadow-lg bg-base-100 rounded-xl w-52 z-50 border border-base-300/60">
                  <li>
                    <Link href="/teacher/profile" className="rounded-lg text-sm">
                      <User className="w-4 h-4" />
                      Профіль
                    </Link>
                  </li>
                  <div className="divider my-0.5 px-3" />
                  <li>
                    <button onClick={handleLogout} className="rounded-lg text-sm text-error">
                      <LogOut className="w-4 h-4" />
                      Вийти
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-20 lg:pb-6 lg:p-6 xl:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-base-100 border-t border-base-300/60 flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-secondary' : 'text-base-content/40'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
