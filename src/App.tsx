import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { ResultCard } from './components/ResultCard';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { identifyMovieFromImage } from './services/geminiService';
import { translations } from './constants/translations';
import { LangType, MovieInfo } from './types';
import { auth, db, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { LogIn, Shield, LogOut, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UserProfile, AdminSettings } from './types';

export default function App() {
  const [lang, setLang] = useState<LangType>('uz');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MovieInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ login: 'diyow', pass: 'DK_0909' });
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const t = translations[lang];

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login error in UI:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setLoginError("Bu domen Firebase'da ruxsat etilmagan. Iltimos, Firebase Console'da ushbu domenni qo'shing.");
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError("Brauzer login oynasini blokladi. Iltimos, pop-up oynalarga ruxsat bering.");
      } else {
        setLoginError("Kirishda xatolik yuz berdi: " + (err.message || "Noma'lum xato"));
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'settings', 'admin'), async (snapshot) => {
      if (snapshot.exists()) {
        setAdminSettings(snapshot.data() as AdminSettings);
      } else {
        const defaultSettings: AdminSettings = { login: 'diyow', pass: 'DK_0909' };
        try {
          await setDoc(doc(db, 'settings', 'admin'), defaultSettings);
          setAdminSettings(defaultSettings);
        } catch (err) {
          console.error("Error creating admin settings:", err);
        }
      }
    }, (error) => {
      console.error("Admin settings listener error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          // Create initial profile if it doesn't exist
          const isAdmin = user.email === 'karimovkamron349@gmail.com';
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            role: isAdmin ? 'admin' : 'user',
            dailyLimit: isAdmin ? 100 : 2,
            requestsToday: 0,
            lastRequestDate: new Date().toISOString().split('T')[0]
          };
          await setDoc(userRef, newProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.fileError);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setMimeType(file.type);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = async () => {
    if (!image || !profile) return;

    const today = new Date().toISOString().split('T')[0];
    let currentRequests = profile.requestsToday;

    // Reset count if it's a new day
    if (profile.lastRequestDate !== today) {
      currentRequests = 0;
    }

    if (currentRequests >= profile.dailyLimit) {
      setError(lang === 'uz' ? "Kunlik limitga yetdingiz. Ertaga urinib ko'ring." : 
            lang === 'ru' ? "Вы достигли дневного лимита. Попробуйте завтра." : 
            "Daily limit reached. Try again tomorrow.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const movieData = await identifyMovieFromImage(image, mimeType);
      setResult(movieData);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', profile.uid), {
        requestsToday: currentRequests + 1,
        lastRequestDate: today
      });

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Yuklanmoqda...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-xl">
            <LogIn className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Xush kelibsiz!</h1>
          <p className="text-zinc-400 mb-8">Kinoni aniqlash uchun tizimga kiring.</p>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Google orqali kirish
          </button>
        </motion.div>
      </div>
    );
  }

  if (showAdmin && profile?.role === 'admin') {
    return (
      <>
        <div className="fixed top-4 right-4 z-[100] flex gap-2">
          <button 
            onClick={() => setShowAdmin(false)}
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold text-sm border border-white/10 hover:bg-zinc-700"
          >
            Dasturga qaytish
          </button>
        </div>
        <AdminPanel />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-yellow-400 selection:text-black pb-20">
      <Header 
        t={t} 
        lang={lang} 
        setLang={setLang} 
        profile={profile} 
        onLogout={logout} 
        onShowAdmin={() => setShowAdminLogin(true)} 
      />

      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => setShowAdmin(true)}
        settings={adminSettings}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Hero t={t} />

        {profile && (
          <div className="mb-8 flex justify-center">
            <div className="bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bugungi limit:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-500" 
                    style={{ width: `${(profile.requestsToday / profile.dailyLimit) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-yellow-400">{profile.requestsToday} / {profile.dailyLimit}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          <UploadSection 
            t={t}
            image={image}
            loading={loading}
            error={error}
            onFileChange={handleFileChange}
            onIdentify={handleIdentify}
            onReset={handleReset}
          />
          <ResultCard t={t} result={result} />
        </div>
      </main>

      <Footer t={t} />
    </div>
  );
}
