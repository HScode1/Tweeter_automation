import Link from "next/link"
import { Twitter, Github, Mail, Heart } from "lucide-react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <Separator />
      <div className="container mx-auto px-8 lg:px-32 xl:px-48 py-8 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
          {/* Logo et Description */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Tweet Automation</h3>
            <p className="text-sm text-muted-foreground max-w-[500px]">
              Automatisez vos tweets et gérez votre présence sur Twitter efficacement.
            </p>
          </div>

          <Separator className="md:hidden" />

          {/* Liens Rapides */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg font-semibold">Navigation</h4>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Accueil
              </Link>
              <Link
                href="/features"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                Tarifs
              </Link>
            </div>
          </div>

          <Separator className="md:hidden" />

          {/* Contact et Réseaux Sociaux */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg font-semibold">Réseaux sociaux</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
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
                  "hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                )}
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="mailto:contact@tweetautomation.com"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                )}
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright et Mentions */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {new Date().getFullYear()} Tweet Automation. Tous droits réservés.
          </p>
          <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>in France</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
