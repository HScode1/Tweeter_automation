"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { motion } from "framer-motion"
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const user = useUser()

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 flex justify-center p-4 z-50 backdrop-blur-sm"
    >
      <header className="bg-white/80 shadow-lg w-full max-w-6xl rounded-full border border-gray-200/20">
        <div className="px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gradient-to-tr from-[#7C3AED] to-[#6D28D9] rounded-full" 
              />
            </Link>

            {/* Navigation Links */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex space-x-1">
                {["Solutions", "Benefits", "How it works", "Integrations", "Blog", "Pricing"].map((item) => (
                  <NavigationMenuItem key={item}>
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} legacyBehavior passHref>
                      <NavigationMenuLink>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100/80 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-all duration-200 inline-block"
                        >
                          {item}
                        </motion.span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              {!user?.isSignedIn ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignInButton  fallbackRedirectUrl="/studio">
                      <Button variant="outline" className="hidden sm:inline-flex rounded-full border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10">
                        Sign In
                      </Button>
                    </SignInButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignUpButton  fallbackRedirectUrl="/studio">
                      <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full shadow-lg shadow-[#7C3AED]/25">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </motion.div>
                </>
              ) : (
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full",
                    }
                  }}
                />
              )}
            </div>
          </nav>
        </div>
      </header>
    </motion.div>
  )
}
