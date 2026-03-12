import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, History, Info, Search, Image as ImageIcon } from 'lucide-react';
import { MovieInfo, TranslationType } from '../types';

interface ResultCardProps {
  t: TranslationType;
  result: MovieInfo | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({ t, result }) => {
  return (
    <div className="lg:col-span-5">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div className="bg-yellow-400/10 text-yellow-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-lg border border-yellow-400/20">
                {t.found}
              </div>
              <History className="text-zinc-700 w-5 h-5" />
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3 leading-none uppercase italic tracking-tighter">
              {result.title}
            </h3>
            <div className="flex items-center gap-2 text-zinc-500 font-bold mb-6 sm:mb-8 text-sm">
              <Film size={14} className="text-yellow-400" />
              <span>{result.year} - {t.year}</span>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-zinc-950/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 text-zinc-400">
                  <Info size={12} className="text-yellow-400" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{t.about}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm italic">
                  "{result.summary}"
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10">
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(result.title + ' movie ' + result.year)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn w-full py-3.5 sm:py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-center text-xs sm:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-zinc-700"
              >
                {t.googleBtn}
                <Search size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl sm:rounded-3xl h-full min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center p-8 sm:p-12 text-center"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-900 rounded-xl sm:rounded-2xl shadow-inner flex items-center justify-center mb-4 sm:mb-6 border border-zinc-800">
              <ImageIcon className="text-zinc-700 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="text-zinc-500 font-bold mb-1 sm:mb-2 text-sm sm:text-base">{t.waiting}</h4>
            <p className="text-zinc-700 text-xs sm:text-sm max-w-[200px]">
              {t.waitingDesc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
