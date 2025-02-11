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
      className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4 hover:shadow-xl transition-shadow duration-300"
    >
      <Icon className="w-8 h-8 text-purple-600" />
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="text-4xl font-bold text-gray-800"
      >
        <AnimatedCounter value={value} delay={delay} />
      </motion.span>
      <span className="text-gray-600 text-center">{label}</span>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-gray-800 mb-4"
        >
          Maximisez votre impact sur Twitter
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
        >
          Notre solution d'automatisation transforme votre création de contenu et démultiplie votre présence sur Twitter
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </div>
    </div>
  );
};

export default StatsSection;