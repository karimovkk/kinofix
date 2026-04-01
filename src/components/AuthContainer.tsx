import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

interface AuthContainerProps {
  onSuccess: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Parol tasdiqlash (register uchun)
    if (!isLogin && password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await api.auth.login({ email, password });
        if (res.token) {
          localStorage.setItem('token', res.token);
          onSuccess();
        }
      } else {
        const res = await api.auth.register({
          email,
          password,
          confirm_password: confirmPassword,
          display_name: displayName,
        });
        if (res.token) {
          localStorage.setItem('token', res.token);
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] max-w-[420px] w-full text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />

        {/* Logo */}
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-3xl rotate-6 opacity-50 blur-lg" />
          <div className="relative bg-gradient-to-tr from-yellow-400 to-amber-300 rounded-3xl w-full h-full flex items-center justify-center shadow-inner">
            <Sparkles className="w-10 h-10 text-black/80" strokeWidth={1.5} />
          </div>
        </motion.div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-zinc-400 text-sm mb-7">
          {isLogin ? 'Continue your movie journey' : 'Join the cinema world'}
        </p>

        {/* Error */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-left"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Display Name (faqat register) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-all placeholder:text-zinc-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min. 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-all placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password (faqat register) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  required={!isLogin}
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="group relative w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 overflow-hidden text-black transition-all disabled:opacity-50 mt-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              {loading ? 'Please wait...' : isLogin
                ? <><LogIn className="w-5 h-5" /> Log In</>
                : <><UserPlus className="w-5 h-5" /> Sign Up</>
              }
            </span>
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-zinc-600 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Login */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setError('Google login tez orada qo\'shiladi')}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-2xl py-3.5 flex items-center justify-center gap-3 text-white text-sm font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Switch */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); setConfirmPassword(''); }}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin
              ? <>Don't have an account? <span className="text-yellow-400">Create Account</span></>
              : <>Already have an account? <span className="text-yellow-400">Log In</span></>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};
