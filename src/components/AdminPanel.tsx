import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Search, Edit2, Save, X, Lock, Trash2, Ban, CheckCircle, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminSettings, UserProfile } from '../types';
import { api } from '../services/api';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  
  // Admin Settings (Backend SystemSettings bilan mos)
  const [defaultDailyLimit, setDefaultDailyLimit] = useState<number>(5);
  const [adminDailyLimit, setAdminDailyLimit] = useState<number>(999999);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
       const [usersData, statsData] = await Promise.all([
         api.admin.getUsers(200),
         api.admin.getStats()
       ]);
       setUsers(usersData);
       setStats(statsData);
       
       if (statsData) {
         setDefaultDailyLimit(statsData.defaultDailyLimit || 5);
         setAdminDailyLimit(statsData.adminDailyLimit || 999999);
       }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async (uid: string) => {
    try {
      await api.admin.updateLimit(uid, editLimit);
      setEditingId(null);
      fetchData(); // Refresh
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    }
  };

  const handleToggleUser = async (uid: string, currentStatus: boolean) => {
    try {
      await api.admin.toggleUser(uid, !currentStatus);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi? Bu barcha tarixni ham o'chirib yuboradi.")) return;
    try {
      await api.admin.deleteUser(uid);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    }
  };

  const handleUpdateRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Rolni ${newRole} ga o'zgartirmoqchimisiz?`)) return;
    try {
      await api.admin.updateRole(uid, newRole);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    }
  };

  const handleUpdateGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      // BUG FIX #6: Backend UpdateSettingsRequest mosligini ta'minlash
      await api.admin.updateSettings({ defaultDailyLimit, adminDailyLimit });
      alert("Sozlamalar muvaffaqiyatli yangilandi!");
      fetchData();
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.phone.includes(searchTerm) || (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && users.length === 0) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-medium">Yuklanmoqda...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              <Shield className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Admin Panel</h1>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-0.5">Control Center</p>
            </div>
          </div>
          
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-tighter flex items-center gap-2.5 transition-all ${
                activeTab === 'users' ? 'bg-zinc-800 text-yellow-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Foydalanuvchilar
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-tighter flex items-center gap-2.5 transition-all ${
                activeTab === 'settings' ? 'bg-zinc-800 text-yellow-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Sozlamalar
            </button>
          </div>
        </header>

        {activeTab === 'users' ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Jami Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
                { label: 'Jami Qidiruvlar', value: stats?.totalSearches || 0, icon: Search, color: 'text-yellow-400' },
                { label: 'Daily Limit', value: stats?.defaultDailyLimit || 5, icon: CheckCircle, color: 'text-emerald-400' },
                { label: 'Admin Limit', value: 'Cheksiz', icon: Shield, color: 'text-purple-400' },
              ].map((s, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
              <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-4">
                <Search className="w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Ism yoki telefon orqali qidirish..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-zinc-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5 bg-zinc-900/20">
                      <th className="px-8 py-5">Foydalanuvchi</th>
                      <th className="px-8 py-5">Rol</th>
                      <th className="px-8 py-5">Kunlik Limit</th>
                      <th className="px-8 py-5">Bugungi ishlatish</th>
                      <th className="px-8 py-5 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="text-zinc-300 hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm">{user.displayName || "Noma'lum"}</span>
                            <span className="text-xs text-zinc-500 font-medium font-mono">{user.phone}</span>
                            {!user.isActive && <span className="text-[9px] text-red-500 font-black uppercase mt-1">Bloklangan 🚫</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => handleUpdateRole(user.uid, user.role)}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                              user.role === 'admin' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 'bg-zinc-800 text-zinc-400 border-white/5 hover:text-zinc-300'
                            }`}
                          >
                            {user.role}
                          </button>
                        </td>
                        <td className="px-8 py-5">
                          {editingId === user.uid ? (
                            <div className="flex items-center gap-2">
                               <input 
                                type="number" 
                                className="bg-zinc-800 border border-yellow-400/30 rounded-lg px-3 py-1.5 w-24 text-white text-sm font-bold focus:outline-none focus:border-yellow-400"
                                value={editLimit}
                                onChange={(e) => setEditLimit(parseInt(e.target.value))}
                              />
                              <button onClick={() => handleUpdateLimit(user.uid)} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-lg"><Save className="w-4 h-4"/></button>
                              <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:bg-zinc-800 p-1.5 rounded-lg"><X className="w-4 h-4"/></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 cursor-pointer hover:text-white" onClick={() => { setEditingId(user.uid); setEditLimit(user.dailyLimit); }}>
                              <span className="text-sm font-bold">{user.dailyLimit}</span>
                              <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${user.requestsToday >= user.dailyLimit ? 'bg-red-500' : 'bg-yellow-400'}`}
                                style={{ width: `${Math.min(100, (user.requestsToday / (user.dailyLimit || 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold font-mono">{user.requestsToday} / {user.dailyLimit}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleToggleUser(user.uid, user.isActive)}
                                className={`p-2.5 rounded-xl transition-all ${user.isActive ? 'hover:bg-red-500/10 text-zinc-500 hover:text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                                title={user.isActive ? "Bloklash" : "Faollashtirish"}
                              >
                                {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.uid)}
                                className="p-2.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-xl transition-all"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-yellow-400/10 rounded-2xl">
                <Database className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Tizim Sozlamalari</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Global Parameters</p>
              </div>
            </div>

            <form onSubmit={handleUpdateGlobalSettings} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Standart Kunlik Limit</label>
                <div className="relative">
                  <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input 
                    type="number"
                    value={defaultDailyLimit}
                    onChange={(e) => setDefaultDailyLimit(parseInt(e.target.value))}
                    className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4.5 pl-13 pr-4 text-white text-sm font-bold focus:outline-none focus:border-yellow-400/50 transition-all focus:bg-zinc-800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase">searches</span>
                </div>
                <p className="text-[10px] text-zinc-600 ml-1 font-medium italic">Yangi foydalanuvchilar uchun avtomatik o'rnatiladigan limit.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Admin Kunlik Limit</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input 
                    type="number"
                    value={adminDailyLimit}
                    onChange={(e) => setAdminDailyLimit(parseInt(e.target.value))}
                    className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4.5 pl-13 pr-4 text-white text-sm font-bold focus:outline-none focus:border-yellow-400/50 transition-all focus:bg-zinc-800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase">unlimited</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saveLoading}
                className="group relative w-full font-black py-5 rounded-[1.25rem] overflow-hidden text-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 mt-4 shadow-[0_0_30px_rgba(250,204,21,0.1)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-yellow-400 group-hover:bg-yellow-300 transition-colors" />
                <span className="relative flex items-center justify-center gap-3">
                  {saveLoading ? "Saqlanmoqda..." : <>Saqlash <Save className="w-5 h-5" /></>}
                </span>
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};
