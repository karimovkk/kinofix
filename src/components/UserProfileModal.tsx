import React, { useState, useEffect } from 'react';
import { X, User, Lock, History, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { SearchHistory, TranslationType, UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  t: TranslationType;
  onRefreshProfile: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, profile, t, onRefreshProfile }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
    if (isOpen && profile) {
      setNewName(profile.displayName || '');
    }
    if (!isOpen) {
      setMessage(null);
      setIsEditingPassword(false);
      setIsEditingName(false);
    }
  }, [isOpen, activeTab, profile]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.user.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("History fetch error", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await api.user.updateName(newName);
      setIsEditingName(false);
      onRefreshProfile();
      setMessage({ type: 'success', text: "Ism muvaffaqiyatli o'zgartirildi" });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Xatolik yuz berdi" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) return;
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" });
      return;
    }
    
    setActionLoading(true);
    setMessage(null);
    try {
      // BUG FIX #4: Backend oldPassword va newPassword talab qiladi
      await api.user.updatePassword({ oldPassword, newPassword });
      setIsEditingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: "Parol muvaffaqiyatli yangilandi!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Xatolik yuz berdi" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.user.deleteHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      alert("O'chirishda xatolik");
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <User className="w-6 h-6 text-yellow-400" />
              {t.profileTitle}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-white/10 bg-zinc-900">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'profile' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <User className="w-4 h-4" />
              Profil
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'history' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <History className="w-4 h-4" />
              {t.history}
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Telefon raqam</label>
                  <div className="mt-1 px-4 py-3 bg-zinc-800/50 rounded-xl text-zinc-300 border border-white/5">
                    {profile.phone}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Ism</label>
                  {isEditingName ? (
                    <div className="mt-1 flex gap-2">
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50"
                      />
                      <button 
                        onClick={handleUpdateName}
                        disabled={actionLoading}
                        className="px-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "..." : t.saveChanges}
                      </button>
                      <button 
                        onClick={() => setIsEditingName(false)}
                        className="px-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-xl border border-white/5">
                      <span className="text-zinc-300">{profile.displayName || "Kiritilmagan"}</span>
                      <button onClick={() => { setIsEditingName(true); setNewName(profile.displayName || ''); }} className="text-zinc-500 hover:text-yellow-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t.changePassword}</label>
                  {isEditingPassword ? (
                    <div className="mt-1 space-y-3">
                      <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Hozirgi parol"
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50"
                      />
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yangi parol (min. 6 belgi)"
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400/50"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleUpdatePassword}
                          disabled={actionLoading}
                          className="flex-1 bg-yellow-400 text-black font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? "Kutilmoqda..." : t.saveChanges}
                        </button>
                        <button 
                          onClick={() => { setIsEditingPassword(false); setOldPassword(''); setNewPassword(''); }}
                          className="px-6 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <button 
                        onClick={() => setIsEditingPassword(true)}
                        className="text-sm text-yellow-400 hover:underline flex items-center gap-2 font-medium"
                      >
                        <Lock className="w-4 h-4" />
                        {t.changePassword}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm">Yuklanmoqda...</p>
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8 font-medium">Qidiruv tarixi bo'sh</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="bg-zinc-800/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-800/80 transition-all group">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white truncate">{item.movieTitle}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-zinc-500 font-medium">
                          <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Noma\'lum vaqt'}</span>
                          {item.year && <span className="text-zinc-400">Yil: {item.year}</span>}
                          {item.confidence && (
                            <span className={`px-1.5 rounded-sm uppercase text-[9px] ${
                              item.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 
                              item.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-500/10 text-zinc-400'
                            }`}>
                              {item.confidence}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-2.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
