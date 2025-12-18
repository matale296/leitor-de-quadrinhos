
import React from 'react';
import { Comic, Theme, Translations } from '../types';

interface ComicCardProps {
  comic: Comic;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
  theme: Theme;
  t: Translations;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick, onToggleFavorite, theme, t }) => {
  return (
    <div className="group flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-2">
      <div className="relative aspect-[2/3] w-full rounded-xl border-4 border-black overflow-hidden comic-shadow hover:comic-shadow-red transition-all">
        {comic.thumbnail ? (
          <img 
            src={comic.thumbnail} 
            alt={comic.name} 
            className="w-full h-full object-cover"
            onClick={onClick}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center p-4 text-center" onClick={onClick}>
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <span className="font-comic-header text-xl opacity-40 break-words">{comic.name}</span>
          </div>
        )}
        
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(comic.id); }}
          className={`absolute top-3 right-3 p-2 rounded-full border-2 border-black transition-all transform hover:scale-110 active:scale-90 z-10 ${comic.isFavorite ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white hover:bg-black/70'}`}
        >
          <svg className="w-5 h-5" fill={comic.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded border border-black uppercase tracking-tighter">
          {comic.format}
        </div>
      </div>

      <div className="mt-4 px-1" onClick={onClick}>
        <h4 className="font-comic-body font-bold text-lg leading-tight truncate uppercase group-hover:text-[#c41e3a] transition-colors">{comic.name}</h4>
        {comic.lastRead && (
          <p className="font-comic-body text-xs mt-1 opacity-70 italic">
            {t.lastRead}: {comic.lastRead}
          </p>
        )}
      </div>
    </div>
  );
};
