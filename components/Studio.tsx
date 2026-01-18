
import React, { useState, useRef, useEffect } from 'react';
import { GenerationMode, PhotoAngle, AspectRatio, ParsedDish, StyleTemplate } from '../types';
import { BACKGROUND_PACKS, ANGLES } from '../constants';
import { generateFoodImage, parseMenuText } from '../services/geminiService';
import { storage } from '../services/storageService';

interface MenuDishState extends ParsedDish {
  generatedImage?: string | null;
  isGenerating?: boolean;
  refinementPrompt?: string;
  isSaved?: boolean;
}

export const Studio: React.FC = () => {
  const [inputSource, setInputSource] = useState<'PHOTO' | 'MENU'>('MENU');
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.MENU);
  const [angle, setAngle] = useState<PhotoAngle>(PhotoAngle.HERO_45);
  const [aspect, setAspect] = useState<AspectRatio>(AspectRatio.SQUARE_1_1);
  const [bgPack, setBgPack] = useState(BACKGROUND_PACKS[0]?.id || 'min-white');
  
  const [includeName, setIncludeName] = useState(false);
  const [includePrice, setIncludePrice] = useState(false);
  const [textStyle, setTextStyle] = useState('Minimalistyczny Badge');
  const [lightingStyle, setLightingStyle] = useState('Studyjne Miękkie');
  const [focusStyle, setFocusStyle] = useState('Rozmyte tło (Bokeh)');
  const [globalRefinement, setGlobalRefinement] = useState('');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [isSingleGenerating, setIsSingleGenerating] = useState(false);
  const [isSingleSaved, setIsSingleSaved] = useState(false);

  const [menuText, setMenuText] = useState('');
  const [parsedDishes, setParsedDishes] = useState<MenuDishState[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [savedTemplates, setSavedTemplates] = useState<StyleTemplate[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedTemplates(storage.getTemplates());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setSingleResult(null);
        setIsSingleSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToLibrary = (imageUrl: string, dishName: string, id: string, listIdx?: number) => {
    storage.saveToLibrary({
      id: Math.random().toString(36).substr(2, 9),
      dishName,
      imageUrl,
      mode,
      createdAt: Date.now()
    });
    if (listIdx !== undefined) {
      setParsedDishes(prev => prev.map((d, i) => i === listIdx ? { ...d, isSaved: true } : d));
    } else {
      setIsSingleSaved(true);
    }
  };

  const applyTemplate = (t: StyleTemplate) => {
    setBgPack(t.backgroundId);
    setLightingStyle(t.lightingStyle);
    setFocusStyle(t.focusStyle);
    setAngle(t.angle);
    setAspect(t.aspectRatio);
  };

  const downloadImage = (base64Data: string, filename: string) => {
    if (!base64Data) return;
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `${filename.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseMenu = async () => {
    if (!menuText.trim()) return;
    setIsParsing(true);
    setErrorMessage(null);
    try {
      const dishes = await parseMenuText(menuText);
      if (dishes && Array.isArray(dishes)) {
        setParsedDishes(dishes.map(d => ({ ...d, generatedImage: null, isGenerating: false, refinementPrompt: '', isSaved: false })));
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsParsing(false);
    }
  };

  const generateForDish = async (idx: number) => {
    const dish = parsedDishes[idx];
    setParsedDishes(prev => prev.map((d, i) => i === idx ? { ...d, isGenerating: true } : d));

    const selectedPack = BACKGROUND_PACKS.find(p => p.id === bgPack);
    const prompt = `Styl: ${selectedPack?.name}. Kąt: ${angle}. Tło: ${selectedPack?.tag}.`;

    try {
      const res = await generateFoodImage(null, prompt, {
        aspectRatio: aspect,
        mode,
        dishName: dish.name,
        dishPrice: dish.price,
        includeName: mode === GenerationMode.SOCIAL && includeName,
        includePrice: mode === GenerationMode.SOCIAL && includePrice,
        textStyle,
        refinementPrompt: dish.refinementPrompt,
        lightingStyle,
        focusStyle
      });
      setParsedDishes(prev => prev.map((d, i) => i === idx ? { ...d, generatedImage: res, isGenerating: false, isSaved: false } : d));
    } catch (err) {
      setParsedDishes(prev => prev.map((d, i) => i === idx ? { ...d, isGenerating: false } : d));
    }
  };

  const startSinglePhotoGen = async () => {
    if (!uploadedImage) return;
    setIsSingleGenerating(true);
    const selectedPack = BACKGROUND_PACKS.find(p => p.id === bgPack);
    const prompt = `Styl: ${selectedPack?.name}. Kąt: ${angle}. Tło: ${selectedPack?.tag}.`;
    
    try {
      const sourceImage = singleResult || uploadedImage;
      const res = await generateFoodImage(sourceImage, prompt, { 
        aspectRatio: aspect, 
        mode,
        textStyle,
        refinementPrompt: globalRefinement,
        lightingStyle,
        focusStyle
      });
      if (res) {
        setSingleResult(res);
        setIsSingleSaved(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSingleGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#0A0A0B] overflow-hidden animate-in fade-in duration-500">
      <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar z-20">
        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 tracking-tighter uppercase italic">
          <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
          Studio Pro
        </h2>

        <div className="space-y-6">
          {savedTemplates.length > 0 && (
            <div>
               <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block px-1">Twoje Style</label>
               <div className="flex flex-wrap gap-2">
                 {savedTemplates.map(t => (
                   <button 
                     key={t.id}
                     onClick={() => applyTemplate(t)}
                     className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-orange-500 hover:bg-orange-500 hover:text-white transition"
                   >
                     {t.name}
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Metoda Wejścia</label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => { setInputSource('MENU'); setErrorMessage(null); }}
                className={`py-3 px-2 text-[10px] font-black rounded-xl transition-all ${inputSource === 'MENU' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                MENU
              </button>
              <button 
                onClick={() => { setInputSource('PHOTO'); setErrorMessage(null); }}
                className={`py-3 px-2 text-[10px] font-black rounded-xl transition-all ${inputSource === 'PHOTO' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                ZDJĘCIE
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Przeznaczenie</label>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode(GenerationMode.MENU)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${mode === GenerationMode.MENU ? 'bg-white text-black' : 'text-white/40'}`}
              >
                SKLEP
              </button>
              <button 
                onClick={() => setMode(GenerationMode.SOCIAL)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${mode === GenerationMode.SOCIAL ? 'bg-white text-black' : 'text-white/40'}`}
              >
                SOCIAL
              </button>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
             <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Korektor AI</label>
             <textarea 
               value={globalRefinement}
               onChange={(e) => setGlobalRefinement(e.target.value)}
               placeholder="Np. 'usuń cytrynę', 'dodaj dym'..."
               className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none focus:border-orange-500 transition resize-none"
             />
          </div>

          <div className="space-y-4">
             <div>
               <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Oświetlenie</label>
               <select value={lightingStyle} onChange={(e) => setLightingStyle(e.target.value)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500">
                 <option value="Studyjne Miękkie" className="bg-black">Studyjne Miękkie</option>
                 <option value="Naturalne Słoneczne" className="bg-black">Naturalne Słoneczne</option>
                 <option value="Nastrojowe / Ciemne" className="bg-black">Nastrojowe / Ciemne</option>
                 <option value="Neonowe / Urban" className="bg-black">Neonowe / Urban</option>
               </select>
             </div>
             <div>
               <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Ostrość</label>
               <select value={focusStyle} onChange={(e) => setFocusStyle(e.target.value)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500">
                 <option value="Rozmyte tło (Bokeh)" className="bg-black">Bokeh (Portret)</option>
                 <option value="Ostre (Wszystko widoczne)" className="bg-black">Deep Focus</option>
                 <option value="Makro / Detal" className="bg-black">Makro</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Kąt</label>
              <select value={angle} onChange={(e) => setAngle(e.target.value as any)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500">
                {ANGLES.map(a => <option key={a.id} value={a.id} className="bg-black">{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Format</label>
              <select value={aspect} onChange={(e) => setAspect(e.target.value as any)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500">
                {Object.values(AspectRatio).map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Motyw Tła</label>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_PACKS.map(pack => (
                <button 
                  key={pack.id}
                  onClick={() => setBgPack(pack.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${bgPack === pack.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                >
                  <div className="text-[10px] font-black text-white mb-1 leading-none">{pack.name}</div>
                  <div className="text-[7px] text-white/30 uppercase font-bold tracking-widest">{pack.tag.split(',')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {inputSource === 'PHOTO' && (
          <div className="mt-auto pt-6 border-t border-white/5">
             <button 
               onClick={startSinglePhotoGen}
               disabled={!uploadedImage || isSingleGenerating}
               className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm shadow-2xl hover:bg-orange-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 uppercase italic"
             >
               {isSingleGenerating ? 'RENDEROWANIE...' : (singleResult ? 'POPRAW OBRAZ AI' : 'URUCHOM STUDIO AI')}
             </button>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-12 flex flex-col items-center bg-[radial-gradient(circle_at_center,_#1A1A1E_0%,_#0A0A0B_100%)]">
        {inputSource === 'MENU' ? (
          <div className="w-full max-w-6xl">
            {parsedDishes.length === 0 ? (
              <div className="bg-white/[0.03] backdrop-blur-3xl p-16 rounded-[60px] border border-white/10 flex flex-col items-center max-w-3xl mx-auto shadow-2xl animate-in slide-in-from-bottom-10">
                <div className="w-24 h-24 bg-orange-600 text-white rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-orange-600/20">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic text-center">Analiza Karty Menu</h2>
                <textarea 
                  className="w-full h-64 p-8 bg-black/40 border border-white/10 rounded-[40px] text-white text-sm focus:ring-2 focus:ring-orange-600 outline-none transition resize-none mb-6 shadow-inner"
                  placeholder="Wklej treść swojego menu, np:&#10;Burger Klasyk - 100% wołowina, pikle, sos - 39 zł&#10;Sałatka Cezar - kurczak, sałata rzymska - 32 zł"
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                />
                
                {errorMessage && (
                  <div className="w-full p-4 mb-6 bg-red-600/20 border border-red-600/40 rounded-2xl text-red-400 text-xs font-bold text-center uppercase tracking-widest animate-pulse">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <button 
                  onClick={handleParseMenu}
                  disabled={isParsing || !menuText.trim()}
                  className="w-full py-6 bg-white text-black font-black text-lg rounded-3xl hover:bg-orange-600 hover:text-white transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 uppercase italic"
                >
                  {isParsing ? 'ANALIZOWANIE...' : 'IMPORTUJ LISTĘ PRODUKTÓW'}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                <div className="flex justify-between items-end mb-16 px-4">
                  <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">Importowane Produkty</h2>
                    <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Status: {mode} Mode Active</p>
                  </div>
                  <button onClick={() => { setParsedDishes([]); setErrorMessage(null); }} className="px-8 py-3 bg-white/5 text-white/40 font-black rounded-2xl border border-white/10 hover:bg-white/10 transition uppercase text-[10px] tracking-widest">Resetuj Listę</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {parsedDishes.map((dish, i) => (
                    <div key={dish.id} className="bg-white/5 rounded-[48px] overflow-hidden border border-white/10 flex flex-col group hover:border-orange-500/30 transition-all duration-500 shadow-xl">
                      <div className="aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden">
                        {dish.generatedImage ? (
                          <img src={dish.generatedImage} alt={dish.name} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
                        ) : (
                          <div className="text-center p-12 text-white/5">
                             <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                          </div>
                        )}
                        
                        {dish.isGenerating && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Rendering...</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8 gap-3">
                           <button 
                             onClick={() => generateForDish(i)}
                             disabled={dish.isGenerating}
                             className="flex-1 py-4 bg-white text-black font-black text-[10px] rounded-2xl hover:bg-orange-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-2xl uppercase italic"
                           >
                             {dish.generatedImage ? 'NOWY VARIANT' : 'GENERUJ AI'}
                           </button>
                           {dish.generatedImage && !dish.isSaved && (
                             <button 
                               onClick={() => handleSaveToLibrary(dish.generatedImage!, dish.name, dish.id, i)}
                               className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition transform translate-y-4 group-hover:translate-y-0"
                             >
                               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
                             </button>
                           )}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow bg-white/[0.01]">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-black text-white leading-none uppercase tracking-tighter italic">{dish.name}</h4>
                          <span className="text-sm font-black text-orange-500 ml-4">{dish.price}</span>
                        </div>
                        
                        <div className="mb-6">
                           <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Poprawka (np. 'dodaj pietruszkę')</label>
                           <input 
                             type="text"
                             value={dish.refinementPrompt || ''}
                             onChange={(e) => setParsedDishes(prev => prev.map((d, idx) => idx === i ? { ...d, refinementPrompt: e.target.value } : d))}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:border-orange-500/50 outline-none transition"
                           />
                        </div>

                        {dish.isSaved && (
                          <div className="mt-auto py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-[10px] font-black uppercase text-center tracking-widest">
                            Zapisano w bibliotece
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-4">
                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Zdjęcie Surowe</h3>
                 <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-white/5 rounded-[60px] border-4 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/30 transition-all overflow-hidden shadow-inner group">
                   {uploadedImage ? (
                     <img src={uploadedImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                   ) : (
                     <div className="text-center p-8">
                       <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                       <p className="text-white/20 font-black uppercase text-xs tracking-widest">Wgraj zdjęcie dania</p>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Wynik Studio AI</h3>
                 <div className={`aspect-square bg-white/5 rounded-[60px] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl ${isSingleGenerating ? 'animate-pulse' : ''}`}>
                    {singleResult ? (
                      <img src={singleResult} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                    ) : (
                      <div className="opacity-5 italic font-black uppercase text-4xl select-none">StudioShot AI</div>
                    )}
                    {isSingleGenerating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center">
                         <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-6 shadow-xl"></div>
                         <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Rendering grafiki...</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
            
            {singleResult && (
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 animate-in slide-in-from-bottom-5">
                 <button onClick={() => { setSingleResult(null); setIsSingleSaved(false); }} className="px-12 py-4 bg-white/5 text-white/40 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest">Resetuj</button>
                 {!isSingleSaved ? (
                   <button 
                     onClick={() => handleSaveToLibrary(singleResult!, 'Zdjecie AI', 'single')}
                     className="px-16 py-5 bg-orange-600 text-white font-black rounded-2xl shadow-2xl hover:bg-orange-700 hover:scale-105 transition active:scale-95 uppercase text-xs tracking-widest italic"
                   >
                     Zapisz w Bibliotece
                   </button>
                 ) : (
                   <div className="px-16 py-5 bg-green-500/20 border border-green-500/30 text-green-500 font-black rounded-2xl flex items-center gap-3 uppercase text-xs tracking-widest">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                     Gotowe
                   </div>
                 )}
                 <button onClick={() => downloadImage(singleResult!, 'studio-shot')} className="px-12 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition text-xs uppercase tracking-widest italic">Pobierz PNG</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
