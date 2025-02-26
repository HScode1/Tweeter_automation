import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const testimonials = [
  {
    content: "Cette solution a révolutionné ma stratégie sur Twitter. Je gagne un temps précieux tout en maintenant une présence constante.",
    author: "Marie Laurent",
    role: "Créatrice de contenu",
    avatar: "/avatars/avatar-1.jpg"
  },
  {
    content: "L'IA comprend parfaitement l'essence de mes vidéos et crée des tweets qui engagent vraiment ma communauté.",
    author: "Thomas Dubois",
    role: "YouTubeur Tech",
    avatar: "/avatars/avatar-2.jpg"
  },
  {
    content: "Un outil indispensable pour tout créateur de contenu. La qualité des tweets générés est impressionnante !",
    author: "Sophie Martin",
    role: "Blogueuse & Influenceuse",
    avatar: "/avatars/avatar-3.jpg"
  }
];

const staggerChildrenVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const testimonialVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add('animate');
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-32 relative overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {/* Decorative Blobs */}
      <motion.div 
        className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-purple-600 mix-blend-overlay filter blur-3xl opacity-30"
        animate={{ 
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-violet-500 mix-blend-overlay filter blur-3xl opacity-30"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />

      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-96 rounded-full bg-gradient-to-r from-[#a2d45e]/10 to-purple-500/10 mix-blend-overlay filter blur-3xl opacity-20"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="inline-block mb-4">
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            />
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight leading-tight">
              Témoignages
            </h2>
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-purple-500 to-[#a2d45e] rounded-full mx-auto mt-6"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-6">
            Découvrez ce que nos utilisateurs disent de notre solution d'automatisation de tweets
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
          variants={staggerChildrenVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={testimonialVariants}
              className="group relative backdrop-blur-sm bg-white/10 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(163,0,255,0.2)] transition-all duration-500 border border-purple-500/20 hover:border-[#a2d45e]/40"
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-900/30 to-black/50 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
              
              <motion.div 
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-t-3xl transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
              />
              
              <div className="relative">
                <div className="absolute -top-6 -left-3 text-7xl text-[#a2d45e]/30 opacity-50 font-serif">&quot;</div>
                
                <p className="text-gray-100 mb-8 relative z-10 leading-relaxed text-lg">
                  {testimonial.content}
                </p>
                
                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#a2d45e] to-purple-500 blur p-1" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/30">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        sizes="64px"
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-white text-lg">{testimonial.author}</h3>
                    <p className="text-[#a2d45e] font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-3xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#a2d45e]/80 to-purple-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform origin-top-right scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </div>
              
              <motion.div 
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#a2d45e] opacity-0 group-hover:opacity-80 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom decorative element */}
        <div className="mt-20 flex justify-center">
          <motion.div 
            className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
        </div>
      </div>
    </section>
  );
}