'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, ClipboardCheck, Users,
  CreditCard, LogOut, User, Settings, Bell,
  ChevronLeft, Menu, GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'

const navItems = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Контент', icon: BookOpen },
  { href: '/admin/theory', label: 'Теорія', icon: GraduationCap },
  { href: '/admin/tests', label: 'Тести', icon: ClipboardCheck },
  { href: '/admin/students', label: 'Учні', icon: Users },
  { href: '/admin/payments', label: 'Платежі', icon: CreditCard },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, checked, fetchMe, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (checked && !user) {
      router.push('/login')
    }
    if (checked && user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [checked, user, router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (!checked || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-base-200/30">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        flex flex-col h-screen bg-neutral text-neutral-content overflow-y-auto
        transition-all duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-[4.5rem]' : 'w-64'}
      `}>
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary-content" />
              </div>
              <div>
                <span className="font-bold text-sm">AutoSchool</span>
                <span className="text-[10px] text-gray-400 block -mt-0.5">Адміністрування</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary-content" />
            </div>
          )}
          <button
            className="hidden lg:flex btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${collapsed ? 'justify-center' : ''}
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-white/10">
          {collapsed ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors"
              title="Вийти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-xs font-medium">{user.first_name?.[0] || user.username[0]}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">Адміністратор</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Вийти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/60 h-16 flex items-center px-4 lg:px-6">
          <button
            className="btn btn-ghost btn-sm btn-square lg:hidden mr-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm btn-circle">
              <Bell className="w-5 h-5 text-base-content/60" />
            </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-7">
                    <span className="text-xs">{user.first_name?.[0] || user.username[0]}</span>
                  </div>
                </div>
                <span className="hidden sm:inline text-sm">{user.first_name || user.username}</span>
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-1.5 shadow-lg bg-base-100 rounded-xl w-52 z-50 border border-base-300/60">
                <li>
                  <Link href="/admin/dashboard" className="rounded-lg text-sm">
                    <LayoutDashboard className="w-4 h-4" />
                    Дашборд
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
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
