
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Comic, Theme, Locale, Translations } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';
import JSZip from 'jszip';

interface ReaderProps {
  comic: Comic;
  onClose: () => void;
  theme: Theme;
  locale: Locale;
  t: Translations;
  onToggleFavorite: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ comic, onClose, theme, t, onToggleFavorite }) => {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fitToPage, setFitToPage] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [cbzImages, setCbzImages] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const epubContainerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);

  // Monitorar mudanças de tela cheia (tecla ESC, etc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRootRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const renderPdfPage = useCallback(async (pageNum: number, currentZoom: number, fit: boolean, rotated: boolean) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch (e) {} }

    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      const rotationDegrees = rotated ? 90 : 0;
      let scale = currentZoom;

      if (fit) {
        const unscaledViewport = page.getViewport({ scale: 1, rotation: rotationDegrees });
        const availableWidth = window.innerWidth;
        const availableHeight = window.innerHeight;

        const scaleW = availableWidth / unscaledViewport.width;
        const scaleH = availableHeight / unscaledViewport.height;

        // Comportamento de preenchimento (stretch) em paisagem
        scale = rotated ? scaleW : Math.min(scaleW, scaleH);
        setZoom(scale);
      }

      const viewport = page.getViewport({ scale, rotation: rotationDegrees });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: context, viewport: viewport };
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: any) { if (err.name !== 'RenderingCancelledException') console.error(err); }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initReader = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await comic.fileData.arrayBuffer();
        if (comic.format === 'pdf') {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          pdfDocRef.current = pdf;
          setTotalPages(pdf.numPages);
        } else if (comic.format === 'epub') {
          const book = ePub(arrayBuffer);
          bookRef.current = book;
          const rendition = book.renderTo(epubContainerRef.current!, { 
            width: "100%", 
            height: "100%", 
            flow: "paginated" 
          });
          renditionRef.current = rendition;
          await rendition.display();
          book.ready.then(() => setTotalPages(book.locations.length() || 100));
        } else if (comic.format === 'cbz') {
          const zip = await JSZip.loadAsync(arrayBuffer);
          const imageFiles = (Object.values(zip.files) as any[])
            .filter((f: any) => !f.dir && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
          const urls = await Promise.all(imageFiles.map(f => f.async("blob").then(b => URL.createObjectURL(b))));
          if (isMounted) { 
            setCbzImages(urls); 
            setTotalPages(urls.length); 
          }
        }
      } catch (err) { console.error(err); }
      finally { if (isMounted) setLoading(false); }
    };
    initReader();
    return () => { isMounted = false; cbzImages.forEach(u => URL.revokeObjectURL(u)); };
  }, [comic]);

  useEffect(() => {
    if (comic.format === 'pdf' && pdfDocRef.current) renderPdfPage(currentPage, zoom, fitToPage, isRotating);
  }, [isRotating, currentPage, zoom, fitToPage, renderPdfPage, comic.format]);

  const handleZoomIn = () => { setFitToPage(false); setZoom(prev => Math.min(prev + 0.05, 12)); };
  const handleZoomOut = () => { setFitToPage(false); setZoom(prev => Math.max(prev - 0.05, 0.05)); };
  const handleToggleFit = () => setFitToPage(true);

  const nextPage = () => currentPage < totalPages && (comic.format === 'epub' ? renditionRef.current?.next() : setCurrentPage(p => p + 1));
  const prevPage = () => currentPage > 1 && (comic.format === 'epub' ? renditionRef.current?.prev() : setCurrentPage(p => p - 1));

  return (
    <div 
      ref={readerRootRef}
      className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f0f0f0]'} overflow-hidden select-none touch-none`}
    >
      
      {/* HUD Superior */}
      <div className="absolute top-0 left-0 right-0 px-4 md:px-6 py-4 bg-gradient-to-b from-black/95 to-transparent text-white flex items-center justify-between z-[110] opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full border-2 border-transparent hover:border-yellow-400 transition-all">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="font-comic-header text-xl md:text-2xl truncate max-w-[150px] md:max-w-xl drop-shadow-lg uppercase tracking-tight">{comic.name}</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsRotating(!isRotating)} 
              title="Rotate Page"
              className={`p-2 rounded-xl border-2 transition-all ${isRotating ? 'bg-yellow-400 text-black border-black shadow-[3px_3px_0px_black]' : 'bg-black/40 border-white/20 hover:border-white text-white'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
              className={`p-2 rounded-xl transition-colors ${comic.isFavorite ? 'text-yellow-400' : 'text-white/40 hover:text-white'}`}
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill={comic.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
        </div>
      </div>

      {/* Área de Leitura */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-transparent custom-scroll relative">
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>}
        
        <div 
          className={`flex items-center justify-center transition-all duration-300 ${isRotating && comic.format !== 'pdf' ? 'rotate-90' : ''}`}
          style={{ 
            width: fitToPage ? (isRotating && comic.format !== 'pdf' ? '100vh' : '100%') : 'auto', 
            height: fitToPage ? (isRotating && comic.format !== 'pdf' ? '100vw' : '100%') : 'auto',
            transform: !fitToPage ? `scale(${zoom}) ${isRotating && comic.format !== 'pdf' ? 'rotate(90deg)' : ''}` : undefined,
          }}
        >
          {comic.format === 'pdf' && <canvas ref={canvasRef} className="shadow-2xl bg-white max-w-none" />}
          {comic.format === 'epub' && <div ref={epubContainerRef} className="w-full h-full bg-white/5" />}
          {comic.format === 'cbz' && cbzImages.length > 0 && (
            <img 
              src={cbzImages[currentPage - 1]} 
              className={`shadow-2xl transition-all duration-200 ${fitToPage ? 'object-contain' : 'max-w-none'}`}
              alt="Page"
              style={{
                width: fitToPage ? (isRotating ? '100vh' : '100%') : 'auto',
                height: fitToPage ? (isRotating ? '100vw' : '100%') : 'auto',
                maxWidth: fitToPage ? '100%' : 'none',
                maxHeight: fitToPage ? '100%' : 'none',
                objectFit: fitToPage && isRotating ? 'cover' : 'contain'
              }}
            />
          )}
        </div>
      </div>

      {/* HUD Inferior */}
      <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 px-3 md:px-10 py-3 md:py-5 bg-black/95 backdrop-blur-2xl rounded-[30px] md:rounded-[40px] border-4 border-black shadow-[6px_6px_0px_rgba(196,30,58,0.5)] text-white flex items-center gap-3 md:gap-10 z-[110] opacity-20 hover:opacity-100 transition-opacity duration-300 w-[95%] md:w-auto justify-center">
        
        <div className="flex items-center gap-1 md:gap-3">
           <button onClick={prevPage} className="p-2 md:p-4 bg-white/10 hover:bg-yellow-500 hover:text-black rounded-xl md:rounded-2xl transition-all active:scale-90">
             <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <div className="px-2 md:px-4 flex flex-col items-center min-w-[50px] md:min-w-[80px]">
             <span className="font-comic-header text-xl md:text-4xl text-yellow-400">{currentPage}</span>
             <span className="text-[8px] md:text-[10px] uppercase font-bold opacity-50 tracking-widest">/ {totalPages}</span>
           </div>
           <button onClick={nextPage} className="p-2 md:p-4 bg-white/10 hover:bg-yellow-500 hover:text-black rounded-xl md:rounded-2xl transition-all active:scale-90">
             <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>

        <div className="hidden xs:block w-px h-8 md:h-10 bg-white/20" />

        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
             <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
           </button>
           
           <button 
             onClick={handleToggleFit} 
             className={`px-3 md:px-6 py-1 rounded-xl font-comic-header text-xs md:text-lg border-2 transition-all ${fitToPage ? 'bg-yellow-400 text-black border-black' : 'bg-white/5 border-white/20'}`}
           >
             {fitToPage ? 'AUTO' : `${Math.round(zoom * 100)}%`}
           </button>

           <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
             <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>

           <div className="w-px h-6 bg-white/20 mx-1" />

           <button 
             onClick={toggleFullscreen}
             className={`p-2 md:p-3 rounded-xl border-2 transition-all ${isFullscreen ? 'bg-blue-500 text-white border-black shadow-[3px_3px_0px_black]' : 'bg-white/10 border-transparent hover:border-white text-white'}`}
             title="Full Screen"
           >
             <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {isFullscreen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0M4 4l0 5m11 0l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5m11 0l5 5m0 0l-5 0m5 0l0-5" />
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
               )}
             </svg>
           </button>
        </div>

      </div>
    </div>
  );
};
