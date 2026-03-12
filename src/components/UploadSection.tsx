import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Loader2, Search, AlertCircle } from 'lucide-react';
import { TranslationType } from '../types';

interface UploadSectionProps {
  t: TranslationType;
  image: string | null;
  loading: boolean;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIdentify: () => void;
  onReset: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  t,
  image,
  loading,
  error,
  onFileChange,
  onIdentify,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lg:col-span-7 space-y-4 sm:space-y-6">
      <motion.div
        whileHover={{ scale: 1.005 }}
        className={`relative aspect-video rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-zinc-900 shadow-2xl ${
          image ? 'border-yellow-400/50 shadow-yellow-400/5' : 'border-zinc-800 hover:border-yellow-400/40'
        }`}
      >
        {image ? (
          <>
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <button 
              onClick={onReset}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 bg-zinc-900/90 hover:bg-red-500 text-white rounded-xl sm:rounded-2xl backdrop-blur-md transition-all border border-zinc-700 hover:border-red-400 group"
            >
              <X size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </>
        ) : (
          <div 
            className="cursor-pointer flex flex-col items-center p-6 sm:p-12 text-center group w-full h-full justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-yellow-400 group-hover:rotate-6 transition-all duration-500 shadow-xl">
              <Upload className="text-zinc-500 w-8 h-8 sm:w-10 sm:h-10 group-hover:text-black transition-colors" />
            </div>
            <p className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{t.uploadTitle}</p>
            <p className="text-zinc-600 text-xs sm:text-sm">{t.uploadDesc}</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </motion.div>

      <button
        onClick={onIdentify}
        disabled={!image || loading}
        className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${
          !image || loading 
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-yellow-400/20 active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t.identifying}
          </>
        ) : (
          <>
            <Search size={20} />
            {t.identifyBtn}
          </>
        )}
      </button>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-start gap-3 sm:gap-4 text-red-400"
        >
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="font-medium text-sm sm:text-base">{error}</p>
        </motion.div>
      )}
    </div>
  );
};
