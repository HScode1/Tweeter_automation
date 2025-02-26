import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Twitter, Users, Sparkles, Zap } from 'lucide-react';

const Hero = () => {
  const videoRef = useRef(null);

  const features = [
    { 
      icon: <Twitter className="w-4 h-4" />, 
      text: "Automatisation intelligente de tweets" 
    },
    { 
      icon: <Users className="w-4 h-4" />, 
      text: "Croissance d'audience organique" 
    },
    { 
      icon: <Sparkles className="w-4 h-4" />, 
      text: "Contenu optimisé par IA" 
    }
  ];

  return (
    <div className="relative pt-20 pb-24 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-10" />
        
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
        
        {/* Decorative blobs */}
        <motion.div 
          className="absolute -left-24 top-1/4 w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-3xl"
          animate={{ 
            x: [0, 10, 0, -10, 0],
            y: [0, -10, 0, 10, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -right-24 bottom-1/4 w-96 h-96 rounded-full bg-[#a2d45e] opacity-10 blur-3xl"
          animate={{ 
            x: [0, -10, 0, 10, 0],
            y: [0, 10, 0, -10, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 pt-16">
          {/* Text Column */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/80 border border-purple-500/30 text-sm text-[#a2d45e] mb-6">
                <Zap className="w-4 h-4 mr-2" />
                <span>Révolutionnez votre présence sur Twitter</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 tracking-tight"
            >
              Automatisez vos tweets, <br />
              <span className="text-white">amplifiez votre impact</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Transformez votre contenu existant en tweets engageants générés par IA. Boostez votre audience et restez actif sans effort avec notre solution d'automatisation intelligente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                href="#start"
                className="bg-gradient-to-r from-[#a2d45e] to-purple-500 hover:from-[#a2d45e]/90 hover:to-purple-500/90 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-purple-500/20 flex items-center justify-center"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.a>
              <a
                href="#demo"
                className="bg-black/40 backdrop-blur-sm text-white border border-purple-500/30 hover:border-[#a2d45e]/40 font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                Voir la démo
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-2 text-sm text-gray-300"
                  >
                    <span className="mr-2 text-[#a2d45e]">{feature.icon}</span>
                    {feature.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Video/Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-lg"
          >
            <div className="relative">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Main container */}
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/60 backdrop-blur-sm shadow-2xl">
                {/* Video placeholder */}
                <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    {/* Image placeholder - replace with your video */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                      <div className="text-center p-8">
                        <Twitter className="w-16 h-16 mx-auto mb-4 text-[#a2d45e]" />
                        <div className="text-xl font-semibold text-white mb-2">Visualisez notre solution</div>
                        <p className="text-gray-400">Cliquez pour regarder la démo</p>
                      </div>
                    </div>
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full bg-[#a2d45e] flex items-center justify-center shadow-lg"
                      >
                        <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-l-white border-t-transparent border-b-transparent ml-1"></div>
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Bottom section with testimonial */}
                <div className="p-4 border-t border-purple-500/20">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#a2d45e] to-purple-500 flex items-center justify-center text-white font-bold">
                        JP
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 italic">"J'ai augmenté mon audience de 35% en seulement 2 mois avec cette solution. Incroyable !"</p>
                      <p className="text-xs text-[#a2d45e] mt-1">Jean Petit, Entrepreneur</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center lg:justify-start">
              <span className="text-sm text-gray-400 mr-3">Déjà utilisé par :</span>
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30"></div>
                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30"></div>
                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30">
                  <span className="text-xs text-gray-400">+18</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
    </div>
  );
};

export default Hero;