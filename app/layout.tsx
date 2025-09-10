import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: '方言数据贡献 - WuSutra',
  description: '帮助训练方言AI模型',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="bg-black text-white">
        {children}
        <Navigation />
      </body>
    </html>
  )
}