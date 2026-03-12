import React from 'react';
import { motion } from 'motion/react';
import { Clapperboard, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { LangType, TranslationType } from '../types';

interface HeaderProps {
  t: TranslationType;
  lang: LangType;
  setLang: (lang: LangType) => void;
  profile: any;
  onLogout: () => void;
  onShowAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ t, lang, setLang, profile, onLogout, onShowAdmin }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="bg-yellow-400 p-1.5 sm:p-2 rounded-lg sm:rounded-xl rotate-3 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <Clapperboard className="text-black w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter italic">
            {t.title.split(' ')[0]}<span className="text-yellow-400">{t.title.split(' ')[1]}</span>
          </h1>
        </motion.div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center bg-zinc-800 rounded-lg p-1 border border-zinc-700">
            {(['uz', 'ru', 'en'] as LangType[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all ${
                  lang === l ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {profile && (
            <div className="flex items-center gap-2 sm:gap-4 pl-3 sm:pl-6 border-l border-zinc-800">
              {profile.role === 'admin' && (
                <button 
                  onClick={onShowAdmin}
                  className="p-2 text-zinc-400 hover:text-yellow-400 transition-colors"
                  title="Admin Panel"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{t.userLabel}</span>
                <span className="text-xs font-bold text-zinc-200 truncate max-w-[100px]">{profile.email.split('@')[0]}</span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all"
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
