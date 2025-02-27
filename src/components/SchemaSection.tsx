"use client";

import React, { forwardRef, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/animated-beam";
import { Youtube, Newspaper, Twitter, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

const Square = memo(forwardRef<
  HTMLDivElement,
  { 
    className?: string; 
    children?: React.ReactNode;
    label?: string;
    description?: string;
    delay?: number;
    bgColor?: string;
  }
>(({ className, children, label, description, delay = 0, bgColor = "bg-black/80" }, ref) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center gap-3 group relative"
  >
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center rounded-xl border p-6 shadow-lg w-16 h-16 md:w-20 md:h-20",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-xl hover:border-[#a2d45e]",
        "border-purple-500/20 backdrop-blur-sm",
        bgColor,
        className,
      )}
      aria-label={label}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-900/20 to-[#a2d45e]/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
    {label && (
      <div className="text-center">
        <span className="font-semibold text-white block">
          {label}
        </span>
        {description && (
          <span className="text-sm text-gray-400 mt-1 block max-w-[150px]">
            {description}
          </span>
        )}
      </div>
    )}
  </motion.div>
)));
Square.displayName = "Square";

// Memoized AnimatedBeam for performance
const MemoizedAnimatedBeam = memo(AnimatedBeam);

export function SchemaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const youtubeRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const twitterRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full py-24 px-4 overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white relative" aria-label="Comment ça marche">
      {/* Decorative Blobs */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-purple-600 mix-blend-overlay filter blur-3xl opacity-20" aria-hidden="true" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 rounded-full bg-[#a2d45e] mix-blend-overlay filter blur-3xl opacity-20" aria-hidden="true" />
      
      {/* Top and bottom borders */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" aria-hidden="true" />
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block mb-4" aria-hidden="true">
            <div className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight"
          >
            Automatisation de Contenu Intelligente
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 leading-relaxed"
          >
            Transformez vos vidéos YouTube et articles de blog en tweets engageants automatiquement. 
            Notre IA analyse votre contenu et génère des publications Twitter optimisées pour maximiser votre impact.
          </motion.p>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-[#a2d45e] rounded-full mx-auto mt-6" aria-hidden="true" />
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-center mb-12 text-white"
        >
          Comment ça marche ?
        </motion.h2>

        <div
          ref={containerRef}
          className={cn(
            "relative flex min-h-[500px] w-full items-center justify-around rounded-3xl p-12",
            "bg-gradient-to-br from-purple-900/40 to-black/80",
            "border border-purple-500/20 hover:border-[#a2d45e]/40 transition-all duration-500",
            "shadow-2xl shadow-purple-500/5",
            "backdrop-blur-sm"
          )}
          aria-label="Schéma d'automatisation"
        >
          <div className="flex flex-col gap-16 md:gap-20">
            <Square 
              ref={blogRef} 
              label="Blog" 
              description="Importez vos articles de blog"
              delay={0.4}
              bgColor="bg-[#333333]"
            >
              <Newspaper className="w-8 h-8 text-[#a2d45e]" aria-hidden="true" />
            </Square>
            <Square 
              ref={youtubeRef} 
              label="YouTube" 
              description="Connectez votre chaîne"
              delay={0.5}
              bgColor="bg-[#333333]"
            >
              <Youtube className="w-8 h-8 text-red-500" aria-hidden="true" />
            </Square>
          </div>
          
          <Square 
            ref={toolRef} 
            label="Transformation" 
            description="Notre IA analyse et optimise"
            className="w-24 h-24"
            delay={0.6}
            bgColor="bg-[#4c2a80]"
          >
            <Wand2 className="w-12 h-12 text-white" aria-hidden="true" />
          </Square>
          
          <Square 
            ref={twitterRef} 
            label="Twitter" 
            description="Publication automatique"
            delay={0.7}
            bgColor="bg-[#333333]"
          >
            <Twitter className="w-8 h-8 text-blue-400" aria-hidden="true" />
          </Square>

          <MemoizedAnimatedBeam
            containerRef={containerRef}
            fromRef={blogRef}
            toRef={toolRef}
            duration={3}
            className="bg-gradient-to-r from-[#a2d45e]/30 to-purple-500/30 rounded-3xl"
          />
          <MemoizedAnimatedBeam
            containerRef={containerRef}
            fromRef={youtubeRef}
            toRef={toolRef}
            duration={3}
            className="bg-gradient-to-r from-red-500/30 to-purple-500/30 rounded-3xl"
          />
          <MemoizedAnimatedBeam
            containerRef={containerRef}
            fromRef={toolRef}
            toRef={twitterRef}
            duration={3}
            className="bg-gradient-to-r from-purple-500/30 to-blue-400/30 rounded-3xl"
          />

          {/* Background decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
          </div>
        </div>
        
        {/* Bottom decorative element */}
        <div className="mt-12 flex justify-center" aria-hidden="true">
          <div className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full" />
        </div>
      </div>
    </section>
  );
}