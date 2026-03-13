import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { Shield, Users, Settings, Search, Edit2, Save, X, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminSettings } from '../types';

interface UserData {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  dailyLimit: number;
  requestsToday: number;
  lastRequestDate: string;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  
  // Admin Settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ login: 'diyow', pass: 'DK_0909' });
  const [newLogin, setNewLogin] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const usersData: UserData[] = [];
      snapshot.forEach((doc) => {
        usersData.push(doc.data() as UserData);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Admin access error:", error);
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'admin'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminSettings;
        setAdminSettings(data);
        setNewLogin(data.login);
        setNewPass(data.pass);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, []);

  const handleUpdateLimit = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        dailyLimit: editLimit
      });
      setEditingId(null);
    } catch (error) {
      alert("Limitni yangilashda xatolik yuz berdi.");
    }
  };

  const handleUpdateAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'admin'), {
        login: newLogin,
        pass: newPass
      });
      alert("Admin ma'lumotlari muvaffaqiyatli yangilandi!");
    } catch (error) {
      alert("Xatolik yuz berdi.");
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-white">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'users' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Foydalanuvchilar
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Sozlamalar
            </button>
          </div>
        </header>

        {activeTab === 'users' ? (
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Foydalanuvchini qidirish..."
                className="bg-transparent border-none outline-none text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Rol</th>
                    <th className="px-6 py-4 font-medium">Kunlik Limit</th>
                    <th className="px-6 py-4 font-medium">Bugungi so'rovlar</th>
                    <th className="px-6 py-4 font-medium">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="text-zinc-300 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-blue-400/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === user.uid ? (
                          <input 
                            type="number" 
                            className="bg-zinc-800 border border-white/20 rounded px-2 py-1 w-20 text-white"
                            value={editLimit}
                            onChange={(e) => setEditLimit(parseInt(e.target.value))}
                          />
                        ) : (
                          user.dailyLimit
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400" 
                              style={{ width: `${Math.min(100, (user.requestsToday / user.dailyLimit) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{user.requestsToday} / {user.dailyLimit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === user.uid ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateLimit(user.uid)}
                              className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/30"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(user.uid);
                              setEditLimit(user.dailyLimit);
                            }}
                            className="p-1.5 bg-white/5 text-zinc-400 rounded-lg hover:bg-white/10 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-zinc-900 border border-white/10 p-8 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Admin Ma'lumotlari</h2>
            </div>

            <form onSubmit={handleUpdateAdminSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Yangi Login</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Yangi Parol</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={saveLoading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saveLoading ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};
