import React from 'react';
import { motion } from 'motion/react';
import { TranslationType } from '../types';

interface HeroProps {
  t: TranslationType;
}

export const Hero: React.FC<HeroProps> = ({ t }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10 sm:mb-16"
    >
      <h2 className="text-3xl xs:text-4xl md:text-6xl font-black mb-4 leading-[1.1] tracking-tighter">
        {t.heroTitle} <br className="hidden xs:block" />
        <span className="text-yellow-400 underline decoration-zinc-800 underline-offset-4 sm:underline-offset-8">{t.heroSubtitle}</span>
      </h2>
      <p className="text-zinc-500 max-w-xl mx-auto text-sm sm:text-lg px-4">
        {t.description}
      </p>
    </motion.div>
  );
};
