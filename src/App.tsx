import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { ResultCard } from './components/ResultCard';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { translations } from './constants/translations';
import { LangType, MovieInfo, UserProfile } from './types';
import { AuthContainer } from './components/AuthContainer';
import { UserProfileModal } from './components/UserProfileModal';
import { api } from './services/api';

export default function App() {
  const [lang, setLang] = useState<LangType>('uz');
  const [image, setImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MovieInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const t = translations[lang];

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfile(null);
        return;
      }
      const data = await api.user.getProfile();
      setProfile(data);
    } catch {
      setProfile(null);
      localStorage.removeItem('token');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    setShowAdmin(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.fileError);
        return;
      }
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = async () => {
    if (!fileToUpload || !profile) return;

    if (profile.role !== 'admin' && profile.requestsToday >= profile.dailyLimit) {
      setError(
        lang === 'uz' ? "Kunlik limitga yetdingiz. Ertaga urinib ko'ring." :
        lang === 'ru' ? "Вы достигли дневного лимита. Попробуйте завтра." :
        "Daily limit reached. Try again tomorrow."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // BUG FIX #2: backend SearchResponse → { success, result: MovieResult, remainingRequests, historyId }
      const response = await api.search.identify(fileToUpload);

      if (response.success && response.result) {
        const movieResult = response.result;
        setResult({
          title: movieResult.movieTitle || 'Noma\'lum',
          year: movieResult.year || '',
          summary: movieResult.description || '',
          director: movieResult.director,
          genre: movieResult.genre,
        });

        // Qolgan so'rovlar sonini profilda yangilash
        setProfile(prev => prev ? {
          ...prev,
          requestsToday: prev.requestsToday + 1,
        } : prev);
      } else {
        setError(t.error);
      }

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setFileToUpload(null);
    setResult(null);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm font-medium">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <AuthContainer onSuccess={fetchProfile} />;
  }

  // Admin panel — JWT orqali role tekshirilgan, qo'shimcha parol kerak emas
  if (showAdmin && profile.role === 'admin') {
    return (
      <>
        <div className="fixed top-4 right-4 z-[100]">
          <button
            onClick={() => setShowAdmin(false)}
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold text-sm border border-white/10 hover:bg-zinc-700 transition-colors"
          >
            ← Dasturga qaytish
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
        onLogout={handleLogout}
        onShowAdmin={() => setShowAdmin(true)}
        onShowProfile={() => setShowProfile(true)}
      />

      <UserProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        t={t}
        onRefreshProfile={fetchProfile}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Hero t={t} />

        {profile && profile.role !== 'admin' && (
          <div className="mb-8 flex justify-center">
            <div className="bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.todayLimit}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (profile.requestsToday / profile.dailyLimit) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-yellow-400">
                  {profile.requestsToday} / {profile.dailyLimit}
                </span>
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
