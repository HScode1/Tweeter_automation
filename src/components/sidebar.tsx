'use client'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Clock, Layout, Settings, Users } from "lucide-react"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        {/* User Profile Section */}
        <div className="px-4 py-2">
          {!user ? (
            <SignInButton redirectUrl="/studio">
              <Button className="w-full justify-start gap-2" variant="default">
                Sign In
              </Button>
            </SignInButton>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4 px-4">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full",
                    }
                  }}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <Button className="w-full justify-start gap-2" variant="default">
                <Plus size={20} />
                Create post
              </Button>
            </div>
          )}
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Content
          </h2>
          <div className="space-y-1">
            {user && (
              <>
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
              </>
            )}
          </div>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Configuration
          </h2>
          <div className="space-y-1">
            {user && (
              <>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Users size={20} />
                  Accounts
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings size={20} />
                  Settings
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
