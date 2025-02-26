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
import { Twitter } from "lucide-react"

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 flex justify-center p-4 z-50 backdrop-blur-sm"
    >
      <header className="bg-black/60 backdrop-blur-md shadow-lg w-full max-w-6xl rounded-full border border-purple-500/30 hover:border-[#a2d45e]/40 transition-all duration-300">
        <div className="px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-black border border-purple-500/30 rounded-lg shadow-md flex items-center justify-center mr-3"
              >
                <Twitter className="w-6 h-6 text-[#a2d45e]" />
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] to-purple-400">TweetBoost</span>
            </Link>

            {/* Navigation links */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex space-x-1">
                {["Fonctionnalités", "Avantages", "Comment ça marche", "Intégrations", "Blog", "Tarifs"].map((item) => (
                  <NavigationMenuItem key={item}>
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} legacyBehavior passHref>
                      <NavigationMenuLink>
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-[#a2d45e] rounded-full hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 inline-block"
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
                        className="hidden sm:inline-flex rounded-full border-purple-500/30 text-gray-300 hover:border-[#a2d45e]/40 hover:text-[#a2d45e] bg-black/60"
                      >
                        Se connecter
                      </Button>
                    </SignInButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignUpButton mode="modal" signInFallbackRedirectUrl="/studio" fallbackRedirectUrl="/studio">
                      <Button className="bg-gradient-to-r from-[#a2d45e] to-purple-500 hover:from-[#a2d45e]/90 hover:to-purple-500/90 text-white rounded-full shadow-lg shadow-purple-500/20">
                        S&apos;inscrire
                      </Button>
                    </SignUpButton>
                  </motion.div>
                </>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full opacity-70 blur-sm"></div>
                  <div className="relative">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-full",
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </motion.div>
  )
}