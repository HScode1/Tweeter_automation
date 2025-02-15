import { ClerkProvider } from '@clerk/nextjs'
import '../globals.css'
import { Sidebar } from '@/components/sidebar'
import { motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      >
      <div className="flex min-h-screen">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </ClerkProvider>
  )
}