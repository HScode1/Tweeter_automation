"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, Layout, Settings, Users } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8F7FF] to-white dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pb-12 min-h-screen w-64 bg-gradient-to-b from-[#F8F7FF] to-white dark:from-gray-900 dark:to-gray-800 border-r border-[#6C5CE7]/20 shadow-lg",
        className
      )}
    >
      <div className="space-y-6 py-6">
        {/* Section Profil Utilisateur */}
        <div className="px-4">
          {!user ? (
            <SignInButton fallbackRedirectUrl="/studio">
              <Button className="w-full justify-start gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:opacity-90 text-white rounded-lg transition-all duration-300 hover:scale-105">
                <span>Se connecter</span>
              </Button>
            </SignInButton>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 px-2 py-3 bg-[#6C5CE7]/5 rounded-lg">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-12 h-12 rounded-full ring-2 ring-[#6C5CE7]/30",
                    },
                  }}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#6C5CE7] truncate max-w-[150px]">
                    {user.fullName || "Utilisateur"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              <Link href="new_post" passHref>
                <Button className="w-full justify-start gap-3 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] text-white hover:opacity-90 rounded-lg transition-all duration-300 hover:scale-105">
                  <Plus size={20} />
                  Nouveau post
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="px-3">
          <h2 className="mb-3 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Contenu
          </h2>
          <div className="space-y-2">
            {user && (
              <>
                <Link href="" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <FileText size={20} />
                    Nouveau post
                  </Button>
                </Link>
                <Link href="/schedule" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Clock size={20} />
                    Planifié
                  </Button>
                </Link>
                <Link href="/studio/posts" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Layout size={20} />
                    Posts
                  </Button>
                </Link>
                <Link href="/studio" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
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
          <h2 className="mb-3 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Configuration
          </h2>
          <div className="space-y-2">
            {user && (
              <>
                <Link href="/accounts" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Users size={20} />
                    Comptes
                  </Button>
                </Link>
                <Link href="/settings" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-300 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Settings size={20} />
                    Paramètres
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}