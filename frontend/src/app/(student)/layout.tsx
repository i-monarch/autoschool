'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Car, LogOut, User, BookOpen, ClipboardCheck,
  MessageCircle, Home, CreditCard, Building2,
  ChevronRight, Bell, GraduationCap, FileText, Navigation,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useStudyReminder } from '@/hooks/useStudyReminder'
import { RoadDecor } from '@/components/ui/RoadPattern'

const navItems = [
  { href: '/dashboard', label: 'Головна', icon: Home },
  { href: '/theory', label: 'Теорія', icon: GraduationCap },
  { href: '/courses', label: 'Курси', icon: BookOpen },
  { href: '/tests', label: 'Тести', icon: ClipboardCheck },
  { href: '/europrotocol', label: 'Європротокол', icon: FileText },
  { href: '/routes', label: 'Маршрути', icon: Navigation },
  { href: '/partners', label: 'Автошколи', icon: Building2 },
  { href: '/reminders', label: 'Нагадування', icon: Bell },
  { href: '/chat', label: 'Повідомлення', icon: MessageCircle },
  { href: '/payments', label: 'Оплата', icon: CreditCard },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, checked, fetchMe, logout } = useAuthStore()
  const totalUnread = useChatStore((s) => s.totalUnread)
  const fetchRooms = useChatStore((s) => s.fetchRooms)
  useWebSocket()
  useStudyReminder(user?.role)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (checked && user) {
      useChatStore.getState().setCurrentUserId(user.id)
      fetchRooms()
      const interval = setInterval(fetchRooms, 30000)
      return () => clearInterval(interval)
    }
  }, [checked, user, fetchRooms])

  useEffect(() => {
    if (checked && !user) {
      router.push('/login')
    }
    if (checked && user && user.role !== 'student') {
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard')
    }
  }, [checked, user, router])

  if (!checked || loading || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base-200/40">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-base-100 border-r border-base-300/60 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-5 pb-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-content" />
            </div>
            <span className="text-lg font-bold tracking-tight">AutoSchool</span>
          </Link>
        </div>

        {/* Nav */}
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.href === '/chat' && totalUnread > 0 && (
                  <span className="ml-auto bg-primary text-primary-content text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-base-300/60">
          <Link
            href="/profile"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive('/profile')
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-base-200'
              }
            `}
          >
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-8">
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

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/60">
          <div className="flex items-center h-16 px-4 lg:px-6">
            {/* Mobile logo */}
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-4.5 h-4.5 text-primary-content" />
              </div>
              <span className="text-lg font-bold">AutoSchool</span>
            </Link>

            {/* Desktop: page area */}
            <div className="hidden lg:block flex-1" />

            <div className="ml-auto flex items-center gap-1">
              {/* Notifications */}
              <button className="btn btn-ghost btn-sm btn-circle">
                <Bell className="w-5 h-5 text-base-content/60" />
              </button>

              {/* User dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2 pl-2 pr-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-7">
                      <span className="text-xs">
                        {user.first_name?.[0] || user.username[0]}
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.first_name || user.username}
                  </span>
                </div>
                <ul tabIndex={0} className="dropdown-content menu p-1.5 shadow-lg bg-base-100 rounded-xl w-52 z-50 border border-base-300/60">
                  <li>
                    <Link href="/profile" className="rounded-lg text-sm">
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

        {/* Content */}
        <main className="flex-1 p-4 pb-20 lg:pb-6 lg:p-6 xl:p-8 relative">
          <RoadDecor />
          <div className="relative">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-base-100 border-t border-base-300/60 flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-base-content/40'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
