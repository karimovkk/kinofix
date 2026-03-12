import React from 'react';
import { TranslationType } from '../types';

interface FooterProps {
  t: TranslationType;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="py-8 sm:py-12 border-t border-zinc-900 mt-10 sm:mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            Powered by karimov.dev
          </span>
        </div>
        <p className="text-zinc-700 text-[9px] font-medium uppercase tracking-widest">
          &copy; 2026 {t.title}. {t.footer}
        </p>
      </div>
    </footer>
  );
};
