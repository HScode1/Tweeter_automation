import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Clock, Users, ChartBar } from 'lucide-react';

const AnimatedCounter = ({ value, duration = 2, delay = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => {
    if (value.includes('h')) {
      return `${Math.round(latest)}h+`;
    }
    if (value.includes('x')) {
      return `${Math.round(latest)}x`;
    }
    if (value.includes('%')) {
      return `${Math.round(latest)}%`;
    }
    return Math.round(latest);
  });

  React.useEffect(() => {
    const numeric = parseInt(value.replace(/[^0-9]/g, ''));
    const animation = animate(count, numeric, {
      duration,
      delay,
      ease: "easeOut",
    });

    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

const StatCard = ({ icon: Icon, value, label, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-[#a2d45e]/40 shadow-lg flex flex-col items-center space-y-4 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="p-3 rounded-lg bg-black/80 border border-purple-500/30 group-hover:border-[#a2d45e]/30 transition-colors duration-300">
        <Icon className="w-8 h-8 text-[#a2d45e] group-hover:text-purple-400 transition-colors duration-300" />
      </div>
      
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] to-purple-400"
      >
        <AnimatedCounter value={value} delay={delay} />
      </motion.span>
      
      <span className="text-gray-300 text-center">{label}</span>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <div className="py-24 px-4 bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-purple-600 mix-blend-overlay filter blur-3xl opacity-20" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 rounded-full bg-[#a2d45e] mix-blend-overlay filter blur-3xl opacity-20" />
      
      {/* Top and bottom borders */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6" />
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight"
          >
            Maximisez votre impact sur Twitter
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-300 text-center mb-12 max-w-2xl mx-auto text-lg"
          >
            Notre solution d'automatisation transforme votre création de contenu et démultiplie votre présence sur Twitter
          </motion.p>
          
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-[#a2d45e] rounded-full mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <StatCard 
            icon={Clock}
            value="5h+"
            label="de temps gagné par semaine sur la création de contenu"
            delay={0.3}
          />
          <StatCard 
            icon={Users}
            value="3x"
            label="plus d'engagement sur vos tweets générés automatiquement"
            delay={0.5}
          />
          <StatCard 
            icon={ChartBar}
            value="150%"
            label="d'augmentation moyenne de votre audience en 3 mois"
            delay={0.7}
          />
        </div>
        
        {/* Bottom decorative element */}
        <div className="mt-16 flex justify-center">
          <div className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;