import Link from "next/link"
import { Twitter, Github, Mail, Heart } from "lucide-react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("relative bg-black text-white", className)}>
      {/* Top border gradient */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      <div className="container relative mx-auto px-8 lg:px-32 xl:px-48 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
          {/* Logo et Description */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] to-purple-400">Tweet Automation</h3>
            <p className="text-sm text-gray-500 max-w-[500px]">
              Automatisez vos tweets et gérez votre présence sur Twitter efficacement.
            </p>
          </div>

          <Separator className="md:hidden bg-gray-900" />

          {/* Liens Rapides */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg font-semibold text-white">Navigation</h4>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-500 hover:text-[#a2d45e] transition-colors duration-300"
              >
                Accueil
              </Link>
              <Link
                href="/features"
                className="text-gray-500 hover:text-[#a2d45e] transition-colors duration-300"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/pricing"
                className="text-gray-500 hover:text-[#a2d45e] transition-colors duration-300"
              >
                Tarifs
              </Link>
            </div>
          </div>

          <Separator className="md:hidden bg-gray-900" />

          {/* Contact et Réseaux Sociaux */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg font-semibold text-white">Réseaux sociaux</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-[#a2d45e]/20 hover:text-[#a2d45e] transition-colors duration-300 text-gray-500"
                )}
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-purple-500/20 hover:text-purple-400 transition-colors duration-300 text-gray-500"
                )}
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="mailto:contact@tweetautomation.com"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-gradient-to-r hover:from-[#a2d45e]/20 hover:to-purple-500/20 hover:text-white transition-colors duration-300 text-gray-500"
                )}
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-900" />

        {/* Copyright et Mentions */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {new Date().getFullYear()} Tweet Automation. Tous droits réservés.
          </p>
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-purple-500" />
            <span>in France</span>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative element */}
      <div className="relative flex justify-center py-4">
        <div className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full opacity-50" />
      </div>
    </footer>
  )
}