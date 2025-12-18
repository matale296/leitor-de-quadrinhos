
import React, { useState } from 'react';
import { Locale, Theme, Translations, Comic } from '../types';

interface SidebarProps {
  locale: Locale;
  theme: Theme;
  isOpen: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHome: () => void;
  onFavorites: () => void;
  favorites: Comic[];
  onOpenComic: (comic: Comic) => void;
  t: Translations;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  locale, theme, isOpen, onToggleSidebar, onToggleTheme, onToggleLocale, onFileUpload, onHome, onFavorites, favorites, onOpenComic, t 
}) => {
  const [isFavListOpen, setIsFavListOpen] = useState(false);
  
  const sidebarThemeClasses = theme === 'dark' 
    ? 'bg-[#1e1e1e] border-r-4 border-black' 
    : 'bg-[#ffffff] border-r-4 border-black';

  const menuButtonClasses = "w-full flex items-center gap-3 px-4 py-3 text-left font-comic-body hover:bg-[#c41e3a] hover:text-white transition-all duration-200 border-b border-gray-700/30";

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${sidebarThemeClasses}`}>
        <div className="bg-[#c41e3a] p-6 text-white border-b-4 border-black">
          <h1 className="font-comic-header text-4xl transform -rotate-1">COMIC READER</h1>
          <p className="text-xs mt-1 font-bold opacity-80 uppercase">Gold Archive</p>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scroll">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 font-comic-body">
            {t.allEditions}
          </div>
          
          <button onClick={onHome} className={menuButtonClasses}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {t.home}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => { onFavorites(); setIsFavListOpen(!isFavListOpen); }} 
              className={menuButtonClasses}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              <span className="flex-1">{t.favorites}</span>
              <svg className={`w-4 h-4 transition-transform ${isFavListOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {isFavListOpen && favorites.length > 0 && (
              <div className="bg-black/5 py-2 max-h-48 overflow-y-auto">
                {favorites.map(fav => (
                  <button 
                    key={fav.id}
                    onClick={() => onOpenComic(fav)}
                    className="w-full pl-12 pr-4 py-2 text-left text-xs font-comic-body hover:text-[#c41e3a] truncate transition-colors"
                  >
                    • {fav.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className={`${menuButtonClasses} cursor-pointer`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>{t.uploadLabel}</span>
            <input type="file" className="hidden" accept=".pdf,.epub,.cbz" multiple onChange={onFileUpload} />
          </label>
        </nav>

        <div className="p-4 space-y-3 bg-black/5 border-t border-black/10">
           <button 
              onClick={onToggleLocale}
              className={`w-full py-2 px-4 rounded-lg border-2 border-black comic-shadow transition-all font-comic-body flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white text-black'}`}
            >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
             {locale === 'pt' ? 'Português' : 'English'}
           </button>

           <button 
              onClick={onToggleTheme}
              className={`w-full py-2 px-4 rounded-lg border-2 border-black comic-shadow transition-all font-comic-body flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white text-black'}`}
            >
              {theme === 'dark' ? (
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              {theme === 'dark' ? (locale === 'pt' ? 'Claro' : 'Light') : (locale === 'pt' ? 'Escuro' : 'Dark')}
           </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
};
