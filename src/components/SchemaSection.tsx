"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/animated-beam";
import { Youtube, Newspaper, Twitter, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

const Circle = forwardRef<
  HTMLDivElement,
  { 
    className?: string; 
    children?: React.ReactNode;
    label?: string;
    description?: string;
    delay?: number;
  }
>(({ className, children, label, description, delay = 0 }, ref) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center gap-3 group relative"
  >
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center rounded-2xl border bg-white p-4 shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-xl hover:border-blue-400",
        "dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm",
        "relative",
        className,
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
    {label && (
      <div className="text-center">
        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
          {label}
        </span>
        {description && (
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block max-w-[150px]">
            {description}
          </span>
        )}
      </div>
    )}
  </motion.div>
));
Circle.displayName = "Circle";

export function SchemaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const youtubeRef = useRef<HTMLDivElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const twitterRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full py-12 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 mb-6"
          >
            Automatisation de Contenu Intelligente
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
          >
            Transformez vos vidéos YouTube et articles de blog en tweets engageants automatiquement. 
            Notre IA analyse votre contenu et génère des publications Twitter optimisées pour maximiser votre impact.
          </motion.p>
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200"
        >
          Comment ça marche ?
        </motion.h2>

        <div
          ref={containerRef}
          className={cn(
            "relative flex min-h-[500px] w-full items-center justify-around rounded-3xl p-12",
            "bg-gradient-to-br from-white via-gray-50 to-blue-50",
            "dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/20",
            "border border-gray-200 dark:border-gray-700",
            "shadow-2xl shadow-blue-500/5",
            "backdrop-blur-xl"
          )}
        >
          <div className="flex flex-col gap-16 md:gap-20">
            <Circle 
              ref={blogRef} 
              label="Blog" 
              description="Importez vos articles de blog"
              delay={0.4}
            >
              <Newspaper className="w-8 h-8 text-blue-500" />
            </Circle>
            <Circle 
              ref={youtubeRef} 
              label="YouTube" 
              description="Connectez votre chaîne"
              delay={0.5}
            >
              <Youtube className="w-8 h-8 text-red-500" />
            </Circle>
          </div>
          
          <Circle 
            ref={toolRef} 
            label="Transformation" 
            description="Notre IA analyse et optimise"
            className="h-24 w-24"
            delay={0.6}
          >
            <Wand2 className="w-12 h-12 text-purple-500" />
          </Circle>
          
          <Circle 
            ref={twitterRef} 
            label="Twitter" 
            description="Publication automatique"
            delay={0.7}
          >
            <Twitter className="w-8 h-8 text-blue-400" />
          </Circle>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={blogRef}
            toRef={toolRef}
            duration={3}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={youtubeRef}
            toRef={toolRef}
            duration={3}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={toolRef}
            toRef={twitterRef}
            duration={3}
          />

          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
