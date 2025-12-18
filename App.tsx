
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Comic, Locale, Theme } from './types';
import { translations } from './translations';
import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';
import JSZip from 'jszip';

const PDFJS_VERSION = '4.0.379';
const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

const DB_NAME = 'ComicReaderDB';
const STORE_NAME = 'comics';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>('pt');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [comics, setComics] = useState<Comic[]>([]);
  const [activeComic, setActiveComic] = useState<Comic | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  const t = translations[locale];

  // Atualizar título da aba com base no estado
  useEffect(() => {
    if (activeComic) {
      document.title = `Lendo: ${activeComic.name}`;
    } else {
      document.title = 'Golden Age Comic Reader';
    }
  }, [activeComic]);

  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          setComics(request.result || []);
          setIsDbReady(true);
        };
      } catch (err) {
        setIsDbReady(true);
      }
    };
    loadFromDB();
  }, []);

  const saveToDB = async (newComics: Comic[]) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    newComics.forEach(c => store.put(c));
  };

  const updateInDB = async (comic: Comic) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(comic);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const uploadedComics: Comic[] = [];

    const generateThumbnail = async (file: File) => {
        try {
          const fileLower = file.name.toLowerCase();
          const arrayBuffer = await file.arrayBuffer();
          if (fileLower.endsWith('.pdf')) {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              return canvas.toDataURL('image/jpeg', 0.8);
            }
          } else if (fileLower.endsWith('.cbz')) {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const firstImgFile = Object.values(zip.files).find((f: any) => !f.dir && /\.(jpg|jpeg|png|webp)$/i.test(f.name)) as any;
            if (firstImgFile) {
              const imgBlob = await firstImgFile.async("blob");
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(imgBlob);
              });
            }
          }
        } catch (e) { return undefined; }
    };

    for (const file of fileList) {
      const thumb = await generateThumbnail(file) as string;
      const name = file.name;
      let format: 'pdf' | 'epub' | 'cbz' = 'pdf';
      if (name.toLowerCase().endsWith('.epub')) format = 'epub';
      if (name.toLowerCase().endsWith('.cbz')) format = 'cbz';

      const newComic: Comic = {
        id: Math.random().toString(36).substring(2, 11),
        name: name,
        format: format,
        fileData: file,
        thumbnail: thumb,
        isFavorite: false,
        totalPages: 0,
        currentPage: 0,
      };
      uploadedComics.push(newComic);
    }

    setComics(prev => [...prev, ...uploadedComics]);
    saveToDB(uploadedComics);
    setIsSidebarOpen(false);
    e.target.value = '';
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setComics(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      );
      const changed = updated.find(c => c.id === id);
      if (changed) {
        updateInDB(changed);
        if (activeComic?.id === id) {
          setActiveComic({ ...changed });
        }
      }
      return updated;
    });
  }, [activeComic]);

  const openReader = useCallback((comic: Comic) => {
    const updatedComic = { ...comic, lastRead: new Date().toLocaleDateString() };
    setComics(prev => prev.map(c => c.id === comic.id ? updatedComic : c));
    updateInDB(updatedComic);
    setActiveComic(updatedComic);
  }, []);

  const closeReader = useCallback(() => setActiveComic(null), []);
  const filteredComics = useMemo(() => showFavoritesOnly ? comics.filter(c => c.isFavorite) : comics, [comics, showFavoritesOnly]);
  const favoriteList = useMemo(() => comics.filter(c => c.isFavorite), [comics]);

  if (!isDbReady) return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent animate-spin rounded-full"></div></div>;

  return (
    <div className={`min-h-screen font-ui transition-colors duration-300 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-[#fdf6e3] text-gray-900'}`}>
      <Sidebar 
        locale={locale} theme={theme} isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onToggleLocale={() => setLocale(prev => prev === 'en' ? 'pt' : 'en')}
        onFileUpload={handleFileUpload}
        onHome={() => { setShowFavoritesOnly(false); setIsSidebarOpen(false); }}
        onFavorites={() => { setShowFavoritesOnly(true); setIsSidebarOpen(false); }}
        favorites={favoriteList} onOpenComic={openReader} t={t}
      />
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'md:ml-64'} p-4 md:p-10 min-h-screen`}>
        {activeComic ? (
          <Reader 
            comic={activeComic} onClose={closeReader} theme={theme} locale={locale} t={t}
            onToggleFavorite={() => toggleFavorite(activeComic.id)}
          />
        ) : (
          <Library comics={filteredComics} onOpenComic={openReader} onToggleFavorite={toggleFavorite} onFileUpload={handleFileUpload} t={t} theme={theme} />
        )}
      </main>
      {!activeComic && (
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="md:hidden fixed bottom-6 right-6 bg-[#c41e3a] text-white p-4 rounded-full shadow-2xl z-40 border-2 border-black active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}
    </div>
  );
};

export default App;
