import React from "react";
import { motion } from "framer-motion";
import { useMemo } from "react";

const partners = {
  payments: [
    {
      name: "Stripe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
      alt: "Logo Stripe",
      category: "payment"
    },
    {
      name: "Visa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
      alt: "Logo Visa",
      category: "payment"
    },
    {
      name: "MasterCard",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
      alt: "Logo MasterCard",
      category: "payment"
    }
  ],
  integrations: [
    {
      name: "X (Twitter)",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
      alt: "Logo X (Twitter)",
      category: "integration"
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      alt: "Logo Google",
      category: "integration"
    },
    {
      name: "YouTube",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png",
      alt: "Logo YouTube",
      category: "integration"
    }
  ]
};



const generatePatternStyles = (index) => {
  const topBase = ((index * 17) % 100);
  const leftBase = ((index * 23) % 100);
  const widthBase = 50 + ((index * 13) % 250);
  const heightBase = 50 + ((index * 19) % 250);
  const delayBase = (index * 0.1) % 2;
  const durationBase = 2 + (index % 3);

  return {
    top: `${topBase}%`,
    left: `${leftBase}%`,
    width: `${widthBase}px`,
    height: `${heightBase}px`,
    background: `radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%)`,
    animation: `pulse ${durationBase}s infinite`,
    animationDelay: `${delayBase}s`,
  };
};

const PartnerSection = ({ title, description, partners, delay = 0 }) => (
  <div className="mb-24 last:mb-0">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center mb-12"
    >
      <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      {partners.map((partner, index) => (
        <motion.div
          key={partner.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.6, 
            delay: delay + (index * 0.1),
            ease: "easeOut"
          }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-500 ease-out" />
          <div className="relative flex items-center justify-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/30 transition-all duration-300 overflow-hidden group-hover:border-indigo-200 dark:group-hover:border-indigo-800/30">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            <div className="absolute inset-0 bg-grid-gray-800/[0.03] dark:bg-grid-white/[0.02]" />
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="object-contain w-full h-12 filter dark:brightness-0 dark:invert transition-all duration-300 group-hover:scale-105"
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TrustSection = () => {
  const patternStyles = useMemo(() => 
    Array(20).fill(0).map((_, index) => generatePatternStyles(index)),
    []
  );

  return (
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          {patternStyles.map((style, i) => (
            <div
              key={i}
              className="absolute opacity-[0.15] dark:opacity-[0.05] animate-pulse"
              style={style}
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
          className="text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30"
          >
            <span className="text-indigo-600 dark:text-indigo-300 font-medium">
              Nos Partenaires
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
            Solutions intégrées
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Une plateforme complète avec les meilleures intégrations pour optimiser votre présence en ligne
          </p>
        </motion.div>

        <PartnerSection 
          title="Paiements sécurisés" 
          description="Acceptez les paiements en toute sécurité avec les plus grands acteurs du marché"
          partners={partners.payments} 
        />
        
        <PartnerSection 
          title="Intégrations" 
          description="Connectez-vous aux plateformes les plus populaires pour maximiser votre impact"
          partners={partners.integrations}
          delay={0.3}
        />
      </div>
    </section>
  );
};

export default TrustSection;