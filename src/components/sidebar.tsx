"use client"

import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Clock, Layout, Settings, Users } from "lucide-react"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return null
  }

  return (
    <div
      className={cn(
        "pb-12 min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white border-r border-[#6C5CE7]/10",
        className,
      )}
    >
      <div className="space-y-4 py-4">
        {/* Section Profil Utilisateur */}
        <div className="px-4 py-2">
          {!user ? (
            <SignInButton fallbackRedirectUrl="/studio">
              <Button className="w-full justify-start gap-2 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white transition-colors">
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
                      avatarBox: "w-10 h-10 rounded-full ring-2 ring-[#6C5CE7]/20",
                    },
                  }}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[#6C5CE7]">{user.fullName || "User"}</p>
                  <p className="text-xs text-zinc-500">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <Link href="/studio/create" passHref>
                <Button className="w-full justify-start gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] text-white hover:opacity-90 transition-opacity">
                  <Plus size={20} />
                  Create post
                </Button>
              </Link>
            </div>
          )}
        </div>
        {/* Contenu */}
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Content
          </h2>
          <div className="space-y-1">
            {user && (
              <>
                <Link href="/studio/new" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <FileText size={20} />
                    New post
                  </Button>
                </Link>
                <Link href="/schedule" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <Clock size={20} />
                    Scheduled
                  </Button>
                </Link>
                <Link href="/studio/posts" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <Layout size={20} />
                    Posts
                  </Button>
                </Link>
                <Link href="/studio" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <Layout size={20} />
                    Studio
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Configuration */}
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Configuration
          </h2>
          <div className="space-y-1">
            {user && (
              <>
                <Link href="/accounts" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <Users size={20} />
                    Accounts
                  </Button>
                </Link>
                <Link href="/settings" passHref>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-600 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                    <Settings size={20} />
                    Settings
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
