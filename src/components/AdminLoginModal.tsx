import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Lock, User } from 'lucide-react';
import { AdminSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settings: AdminSettings;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, settings }) => {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === settings.login && pass === settings.pass) {
      onSuccess();
      onClose();
      setLogin('');
      setPass('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Admin Kirish</h2>
              <p className="text-zinc-500 text-sm mt-1">Xavfsizlik uchun ma'lumotlarni kiriting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Login</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                    placeholder="Loginni kiriting"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                    placeholder="Parolni kiriting"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-sm text-center font-medium"
                >
                  Login yoki parol noto'g'ri!
                </motion.p>
              )}

              <button 
                type="submit"
                className="w-full bg-yellow-400 text-black font-bold py-4 rounded-xl hover:bg-yellow-300 transition-all active:scale-[0.98] mt-4"
              >
                Kirish
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
