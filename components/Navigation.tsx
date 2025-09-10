'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/record', label: '录音', icon: '🎙️' },
  { path: '/library', label: '录音库', icon: '📁' },
  { path: '/training', label: '训练中心', icon: '🤖' },
  { path: '/support', label: '支持', icon: '💬' }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}