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
  const { isSignedIn } = useUser()

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 flex justify-center p-4 z-50 backdrop-blur-sm"
    >
      <header className="bg-white/30 backdrop-blur-md shadow-lg w-full max-w-6xl rounded-full border border-[#6C5CE7]/30">
        <div className="px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gradient-to-tr from-[#6C5CE7] to-[#8E7CF8] rounded-full shadow-md"
              />
            </Link>

            {/* Navigation links */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex space-x-1">
                {["Solutions", "Benefits", "How it works", "Integrations", "Blog", "Pricing"].map((item) => (
                  <NavigationMenuItem key={item}>
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} legacyBehavior passHref>
                      <NavigationMenuLink>
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 text-sm font-medium text-[#6C5CE7] rounded-full hover:bg-[#6C5CE7]/20 hover:text-[#8E7CF8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C5CE7] transition-all duration-200 inline-block"
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
              {!isSignedIn ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignInButton mode="modal" fallbackRedirectUrl="/studio" signUpFallbackRedirectUrl="/studio">
                      <Button
                        variant="outline"
                        className="hidden sm:inline-flex rounded-full border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7]/20 hover:text-[#8E7CF8]"
                      >
                        Se connecter
                      </Button>
                    </SignInButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignUpButton mode="modal" signInFallbackRedirectUrl="/studio" fallbackRedirectUrl="/studio">
                      <Button className="bg-[#6C5CE7] hover:bg-[#8E7CF8] text-white rounded-full shadow-lg shadow-[#6C5CE7]/40">
                        S'inscrire
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
                    },
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

