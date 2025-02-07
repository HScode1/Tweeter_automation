"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
  {
    name: "Partner 1",
    logo: "/partners/partner1.png",
  },
  {
    name: "Partner 2",
    logo: "/partners/partner2.png",
  },
  {
    name: "Partner 3",
    logo: "/partners/partner3.png",
  },
  // Ajoutez d'autres partenaires ici
];

export function TrustSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-[0.15] dark:opacity-[0.05] animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                background: `radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)`,
                animation: `pulse ${Math.random() * 3 + 2}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20"
          >
            <span className="text-indigo-600 dark:text-indigo-300 font-medium">
              Nos Partenaires
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
            Ils nous font confiance
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Découvrez les entreprises qui nous font confiance pour leur présence sur les réseaux sociaux
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center p-10 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={180}
                    height={70}
                    className="object-contain filter dark:brightness-0 dark:invert transition-all duration-300"
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
