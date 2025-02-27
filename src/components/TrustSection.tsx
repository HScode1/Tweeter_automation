"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Définition des types
interface Partner {
  name: string;
  logo: string;
  alt: string;
  category: string;
}

interface PartnerSectionProps {
  title: string;
  description: string;
  partners: Partner[];
  delay?: number;
}

// Données des partenaires
const partners: { payments: Partner[]; integrations: Partner[] } = {
  payments: [
    {
      name: "Stripe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
      alt: "Logo Stripe",
      category: "payment",
    },
    {
      name: "Visa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
      alt: "Logo Visa",
      category: "payment",
    },
    {
      name: "MasterCard",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
      alt: "Logo MasterCard",
      category: "payment",
    },
  ],
  integrations: [
    {
      name: "X (Twitter)",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
      alt: "Logo X (Twitter)",
      category: "integration",
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      alt: "Logo Google",
      category: "integration",
    },
    {
      name: "YouTube",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png",
      alt: "Logo YouTube",
      category: "integration",
    },
  ],
};

// Composant de carte partenaire amélioré
const PartnerCard: React.FC<{ partner: Partner; index: number; delay: number }> = ({
  partner,
  index,
  delay,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={partner.name}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative rounded-xl overflow-hidden bg-black/60 backdrop-blur-sm border border-purple-500/20 hover:border-[#a2d45e]/40 transition-all duration-300 ${
          isHovered ? 'shadow-lg' : ''
        }`}
      >
        {/* Background gradients */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-[#a2d45e]/10" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative p-6 flex flex-col items-center">
          <div
            className="relative w-full h-16 flex items-center justify-center mb-4"
          >
            <Image
              src={partner.logo}
              alt={partner.alt}
              className="object-contain max-h-12 w-auto brightness-0 invert"
              width={150}
              height={48}
              loading="lazy"
              fetchPriority="low"
              format="webp"
            />
          </div>
          
          <div 
            className={`text-center overflow-hidden transition-all duration-300 ${
              isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0'
            }`}
          >
            <p className="text-sm font-medium text-[#a2d45e] mt-2">{partner.name}</p>
          </div>
        </div>

        {/* Bottom border gradient */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 transition-transform duration-300 ${
            isHovered ? 'scale-x-100' : 'scale-x-0'
          }`}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
};

// Section des partenaires modernisée
const PartnerSection: React.FC<PartnerSectionProps> = ({
  title,
  description,
  partners,
  delay = 0,
}) => {
  return (
    <div className="mb-24 last:mb-0">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-300 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {partners.map((partner, index) => (
          <PartnerCard 
            key={partner.name} 
            partner={partner} 
            index={index} 
            delay={delay} 
          />
        ))}
      </div>
    </div>
  );
};

// Générer des particules pour l'arrière-plan - réduit à 15 particules
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4, // Taille réduite
    opacity: 0.1 + Math.random() * 0.1, // Opacité réduite
    duration: 20 + Math.random() * 20, // Durée augmentée pour moins de calculs
    delay: Math.random() * 5,
  }));
};

// Section de confiance (Trust Section) modernisée
const TrustSection: React.FC = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
  }>>([]);
  const [activeTab, setActiveTab] = useState<"payments" | "integrations">("payments");
  
  // Only generate particles on the client side to avoid hydration mismatch
  useEffect(() => {
    // Réduit à 15 particules au lieu de 30
    setParticles(generateParticles(15));
  }, []);

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Decorative Blobs */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-purple-600 mix-blend-overlay filter blur-3xl opacity-20" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 rounded-full bg-[#a2d45e] mix-blend-overlay filter blur-3xl opacity-20" />
      
      {/* Top and bottom borders */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      {/* Particules d'arrière-plan - optimisées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-purple-500"
            style={{
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: `translateY(${Math.sin(Date.now() / 1000) * 10}px)`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6" />
          </div>
          
          <h2 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight"
          >
            Nos Partenaires
          </h2>
          
          <p 
            className="text-gray-300 text-center mb-12 max-w-2xl mx-auto text-lg"
          >
            Découvrez nos partenaires de confiance qui nous aident à offrir la meilleure expérience possible.
          </p>
          
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-[#a2d45e] rounded-full mx-auto mt-6" />
        </div>

        {/* Onglets modernes */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 rounded-xl bg-black/80 border border-purple-500/20 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "payments"
                  ? "bg-gray-800 text-[#a2d45e] shadow-sm"
                  : "text-gray-400 hover:text-[#a2d45e]"
              }`}
            >
              Paiements
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "integrations"
                  ? "bg-gray-800 text-[#a2d45e] shadow-sm"
                  : "text-gray-400 hover:text-[#a2d45e]"
              }`}
            >
              Intégrations
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === "payments" ? (
            <PartnerSection 
              title="Paiements sécurisés" 
              description="Acceptez les paiements en toute sécurité avec nos partenaires de confiance." 
              partners={partners.payments} 
            />
          ) : (
            <PartnerSection 
              title="Intégrations avancées" 
              description="Connectez-vous aux meilleures plateformes pour étendre vos capacités." 
              partners={partners.integrations} 
            />
          )}
        </div>
        
        {/* Bottom decorative element */}
        <div className="mt-16 flex justify-center">
          <div className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default TrustSection;