import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { ResultCard } from './components/ResultCard';
import { Footer } from './components/Footer';
import { identifyMovieFromImage } from './services/geminiService';
import { translations } from './constants/translations';
import { LangType, MovieInfo } from './types';

export default function App() {
  const [lang, setLang] = useState<LangType>('uz');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MovieInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[lang];

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
    if (!image) return;

    setLoading(true);
    setError(null);
    
    try {
      const movieData = await identifyMovieFromImage(image, mimeType);
      setResult(movieData);
      
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-yellow-400 selection:text-black pb-20">
      <Header t={t} lang={lang} setLang={setLang} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Hero t={t} />

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
