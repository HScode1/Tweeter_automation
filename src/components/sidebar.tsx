'use client'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Clock, Layout, Settings, Users } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Button className="w-full justify-start gap-2" variant="default">
            <Plus size={20} />
            Create post
          </Button>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Content
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <FileText size={20} />
              New post
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Clock size={20} />
              Scheduled
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Layout size={20} />
              Posts
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Layout size={20} />
              Studio
            </Button>
          </div>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Configuration
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users size={20} />
              Accounts
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings size={20} />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
