
import React from 'react';
import { Comic, Theme, Translations } from '../types';
import { ComicCard } from './ComicCard';

interface LibraryProps {
  comics: Comic[];
  onOpenComic: (comic: Comic) => void;
  onToggleFavorite: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: Translations;
  theme: Theme;
}

export const Library: React.FC<LibraryProps> = ({ comics, onOpenComic, onToggleFavorite, onFileUpload, t, theme }) => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Banner */}
      <section className={`relative p-8 rounded-2xl border-4 border-black comic-shadow-yellow transition-all overflow-hidden ${theme === 'dark' ? 'bg-[#ffd700]' : 'bg-[#ffe135]'}`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-black">
            <h2 className="font-comic-header text-5xl md:text-6xl mb-2">{t.welcome}</h2>
            <p className="font-comic-body text-lg max-w-xl font-bold italic">{t.subtitle}</p>
          </div>
          <label className="inline-flex items-center justify-center gap-3 bg-[#c41e3a] text-white px-8 py-4 rounded-xl border-4 border-black comic-shadow font-comic-header text-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer text-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {t.uploadButton}
            <input type="file" className="hidden" accept=".pdf,.epub,.cbz" multiple onChange={onFileUpload} />
          </label>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      </section>

      {/* Grid */}
      <section>
        <div className="flex items-center gap-4 mb-8">
           <h3 className="font-comic-header text-4xl">{t.allEditions}</h3>
           <div className="h-1 flex-1 bg-current opacity-20" />
        </div>

        {comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-gray-500 rounded-3xl opacity-50">
             <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             <h4 className="font-comic-header text-3xl mb-2">{t.noEditions}</h4>
             <p className="font-comic-body font-bold">{t.noEditionsSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {comics.map(comic => (
              <ComicCard 
                key={comic.id} 
                comic={comic} 
                onClick={() => onOpenComic(comic)}
                onToggleFavorite={onToggleFavorite}
                theme={theme}
                t={t}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
