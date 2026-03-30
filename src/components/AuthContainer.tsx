import React, { useState } from 'react';
import { LogIn, UserPlus, Phone, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

interface AuthContainerProps {
  onSuccess: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (val: string) => {
    // Basic formatter for phone numbers, just enforcing + at start for standard "+998901234567" format
    if (val && !val.startsWith('+')) {
      return '+' + val;
    }
    return val;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await api.auth.login({ phone, password });
        if (res.idToken) {
          localStorage.setItem('token', res.idToken);
          onSuccess();
        }
      } else {
        const res = await api.auth.register({ phone, password, displayName });
        if (res.success || res.message) {
          // Attempt to auto-login
          const loginRes = await api.auth.login({ phone, password });
          if (loginRes.idToken) {
            localStorage.setItem('token', loginRes.idToken);
            onSuccess();
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.detail || "Xatolik yuz berdi");
      } catch {
        setError(err.message || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] max-w-[420px] w-full text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />
        
        <motion.div 
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-3xl rotate-6 opacity-50 blur-lg" />
          <div className="relative bg-gradient-to-tr from-yellow-400 to-amber-300 rounded-3xl w-full h-full flex items-center justify-center shadow-inner">
            <Sparkles className="w-12 h-12 text-black/80" strokeWidth={1.5} />
          </div>
        </motion.div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-zinc-400 text-sm font-medium tracking-wide mb-8">
          {isLogin ? "Continue your movie journey" : "Take your first step into the cinema world"}
        </p>

        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3 text-left leading-tight"
            >
              <div className="min-w-[4px] h-full bg-red-500 rounded-full" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Your Name (e.g., Jon Doe)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-400/50 focus:bg-black/60 transition-all font-medium placeholder:text-zinc-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
              <Phone className="w-5 h-5" />
            </div>
            <input 
              type="tel"
              placeholder="+998 90 123 45 67"
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-400/50 focus:bg-black/60 transition-all font-medium placeholder:text-zinc-600"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password"
              placeholder="Password (min. 6 characters)"
              required
              min={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-400/50 focus:bg-black/60 transition-all font-medium placeholder:text-zinc-600"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="group relative w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 overflow-hidden text-black transition-all disabled:opacity-50 mt-6 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              {loading ? (
                "Please wait..."
              ) : isLogin ? (
                <>Log In <LogIn className="w-5 h-5" /></>
              ) : (
                <>Sign Up <UserPlus className="w-5 h-5" /></>
              )}
            </span>
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
          >
            {isLogin ? (
              <>Don't have an account? <span className="text-yellow-400 underline decoration-yellow-400/30 underline-offset-4">Create Account</span></>
            ) : (
              <>Already have an account? <span className="text-yellow-400 underline decoration-yellow-400/30 underline-offset-4">Log In</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
