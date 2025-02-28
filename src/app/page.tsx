'use client'
import { Footer } from "@/components/Footer"
import Navbar from "@/components/Navbar";
import { SchemaSection } from "@/components/SchemaSection"; 
import TrustSection from "@/components/TrustSection";
import StatsSection from "@/components/StatsSection"
import Hero from "@/components/Hero";
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const Testimonials = dynamic(() => import('@/components/Testimonials').then(mod => mod.Testimonials), { 
  ssr: true,
  loading: () => <div className="py-32 bg-gradient-to-b from-black to-gray-900 text-white flex justify-center items-center">
    <div className="animate-pulse text-xl">Chargement des témoignages...</div>
  </div>
});

const CTA = dynamic(() => import('@/components/CTA').then(mod => mod.CTA), { 
  ssr: true,
  loading: () => <div className="py-16 bg-black text-white flex justify-center items-center">
    <div className="animate-pulse text-xl">Chargement...</div>
  </div>
});

const FAQ = dynamic(() => import('@/components/FAQ').then(mod => mod.default), { 
  ssr: true,
  loading: () => <div className="py-16 bg-black text-white flex justify-center items-center">
    <div className="animate-pulse text-xl">Chargement des FAQ...</div>
  </div>
});

const faqItems = [
  {
    question: "Comment l'IA génère-t-elle les tweets ?",
    answer: "Notre IA analyse le contenu de vos vidéos et articles pour en extraire les points clés. Elle utilise ensuite des techniques avancées de traitement du langage naturel pour créer des tweets engageants qui respectent la limite de caractères de Twitter tout en préservant l'essence de votre message."
  },
  {
    question: "Quels types de contenu puis-je transformer en tweets ?",
    answer: "Vous pouvez transformer vos vidéos YouTube et articles de blog en tweets. Notre système est conçu pour traiter différents formats de contenu et les adapter au format spécifique de Twitter."
  },
  {
    question: "Les tweets générés sont-ils personnalisables ?",
    answer: "Oui, vous pouvez examiner et modifier les tweets générés avant leur publication. Notre système vous permet d'ajuster le ton, le style et le contenu pour qu'ils correspondent parfaitement à votre voix et à votre marque."
  },
  {
    question: "Combien de tweets peuvent être générés à partir d'un contenu ?",
    answer: "Le nombre de tweets générés dépend de la longueur et de la richesse de votre contenu source. Notre système optimise la création pour produire un nombre approprié de tweets qui couvrent les points essentiels de votre contenu sans répétition."
  }
];

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black ">
        <main className="container mx-auto px-4 py-16">
        </main>
        <Hero />
        <TrustSection />
        <StatsSection />
        <SchemaSection />
        <Testimonials />
        
        <CTA />
        <FAQ items={faqItems} />
        
        <Footer />
      </div>
    </>
  );
}