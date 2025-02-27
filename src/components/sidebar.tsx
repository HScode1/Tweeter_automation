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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pb-12 min-h-screen w-64 bg-gradient-to-b from-zinc-800 to-zinc-900 border-r border-zinc-700/50 shadow-lg",
        className
      )}
    >
      <div className="flex flex-col h-full py-6 space-y-6">
        {/* Bouton Nouveau Post (en haut) */}
        {user && (
          <div className="px-4">
            <Link href="/new_post" passHref>
              <Button className="w-full justify-start gap-3 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20">
                <Plus size={20} />
                Nouveau post
              </Button>
            </Link>
          </div>
        )}

        {/* Contenu */}
        <div className="px-3">
          <h2 className="mb-3 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Contenu
          </h2>
          <div className="space-y-2">
            {user && (
              <>
                <Link href="/new_post" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <FileText size={20} />
                    Nouveau post
                  </Button>
                </Link>
                <Link href="/schedule" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Clock size={20} />
                    Planifié
                  </Button>
                </Link>
                <Link href="/posts" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Layout size={20} />
                    Posts
                  </Button>
                </Link>
                <Link href="/studio" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
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
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Users size={20} />
                    Comptes
                  </Button>
                </Link>
                <Link href="/settings" passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-200 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg transition-all duration-200 hover:pl-5"
                  >
                    <Settings size={20} />
                    Paramètres
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Section Profil Utilisateur (tout en bas) */}
        <div className="mt-auto px-4">
          {!user ? (
            <SignInButton fallbackRedirectUrl="/studio">
              <Button className="w-full justify-start gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20">
                <span>Se connecter</span>
              </Button>
            </SignInButton>
          ) : (
            <div className="flex items-center space-x-4 px-2 py-3 bg-[#6C5CE7]/10 rounded-lg">
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
                <p className="text-xs text-zinc-300 truncate max-w-[150px]">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}