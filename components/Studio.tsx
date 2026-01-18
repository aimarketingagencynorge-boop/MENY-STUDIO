
import React, { useState, useRef } from 'react';
import { GenerationMode, PhotoAngle, AspectRatio, ParsedDish } from '../types';
import { BACKGROUND_PACKS, ANGLES } from '../constants';
import { generateFoodImage, parseMenuText } from '../services/geminiService';

interface MenuDishState extends ParsedDish {
  generatedImage?: string | null;
  isGenerating?: boolean;
  refinementPrompt?: string;
}

export const Studio: React.FC = () => {
  const [inputSource, setInputSource] = useState<'PHOTO' | 'MENU'>('MENU');
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.MENU);
  const [angle, setAngle] = useState<PhotoAngle>(PhotoAngle.HERO_45);
  const [aspect, setAspect] = useState<AspectRatio>(AspectRatio.SQUARE_1_1);
  const [bgPack, setBgPack] = useState(BACKGROUND_PACKS[0].id);
  
  // Opcje tekstowe dla Studio Pro
  const [includeName, setIncludeName] = useState(false);
  const [includePrice, setIncludePrice] = useState(false);
  const [textStyle, setTextStyle] = useState('Minimalistyczny Badge');

  // Opcje poprawek (Refinement)
  const [globalRefinement, setGlobalRefinement] = useState('');

  // Stan dla pojedynczego zdjęcia
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [isSingleGenerating, setIsSingleGenerating] = useState(false);

  // Stan dla trybu Menu
  const [menuText, setMenuText] = useState('');
  const [parsedDishes, setParsedDishes] = useState<MenuDishState[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setSingleResult(null);
      };
      reader.readAsDataURL(file);
    }
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
    try {
      const dishes = await parseMenuText(menuText);
      setParsedDishes(dishes.map(d => ({ 
        ...d, 
        generatedImage: null, 
        isGenerating: false,
        refinementPrompt: '' 
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const generateForDish = async (dishId: string) => {
    const dish = parsedDishes.find(d => d.id === dishId);
    if (!dish) return;

    setParsedDishes(prev => prev.map(d => d.id === dishId ? { ...d, isGenerating: true } : d));

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
        textStyle: textStyle,
        refinementPrompt: dish.refinementPrompt
      });
      setParsedDishes(prev => prev.map(d => d.id === dishId ? { ...d, generatedImage: res, isGenerating: false } : d));
    } catch (err) {
      setParsedDishes(prev => prev.map(d => d.id === dishId ? { ...d, isGenerating: false } : d));
    }
  };

  const startSinglePhotoGen = async () => {
    if (!uploadedImage) return;
    setIsSingleGenerating(true);
    setSingleResult(null);
    
    const selectedPack = BACKGROUND_PACKS.find(p => p.id === bgPack);
    const prompt = `Styl: ${selectedPack?.name}. Kąt: ${angle}. Tło: ${selectedPack?.tag}. Studyjne oświetlenie.`;
    
    try {
      const res = await generateFoodImage(uploadedImage, prompt, { 
        aspectRatio: aspect, 
        mode,
        includeName: mode === GenerationMode.SOCIAL && includeName,
        includePrice: mode === GenerationMode.SOCIAL && includePrice,
        textStyle: textStyle,
        refinementPrompt: globalRefinement
      });
      setSingleResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSingleGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#0A0A0B] overflow-hidden">
      {/* Sidebar - Studio Pro z rozszerzonymi opcjami */}
      <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col p-6 overflow-y-auto custom-scrollbar z-20">
        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 tracking-tighter uppercase italic">
          <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
          Studio Pro
        </h2>

        {/* Globalne ustawienia */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Metoda Wejścia</label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setInputSource('MENU')}
                className={`py-3 px-2 text-[10px] font-black rounded-xl transition-all ${inputSource === 'MENU' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                TEKST MENU
              </button>
              <button 
                onClick={() => setInputSource('PHOTO')}
                className={`py-3 px-2 text-[10px] font-black rounded-xl transition-all ${inputSource === 'PHOTO' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                ZDJĘCIE
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Tryb Publikacji</label>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode(GenerationMode.MENU)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${mode === GenerationMode.MENU ? 'bg-white text-black shadow-xl' : 'text-white/40'}`}
              >
                MENU (TYLKO PRODUKT)
              </button>
              <button 
                onClick={() => setMode(GenerationMode.SOCIAL)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition ${mode === GenerationMode.SOCIAL ? 'bg-white text-black shadow-xl' : 'text-white/40'}`}
              >
                SOCIAL (Z NAPISEM)
              </button>
            </div>
          </div>

          {/* Opcje tekstowe SOCIAL - tylko jeśli SOCIAL */}
          {mode === GenerationMode.SOCIAL && (
            <div className="p-4 bg-orange-600/5 rounded-2xl border border-orange-600/10 space-y-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] block">Konfiguracja Napisów</label>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70">Pokaż nazwę dania</span>
                <button 
                  onClick={() => setIncludeName(!includeName)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${includeName ? 'bg-orange-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeName ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70">Pokaż cenę</span>
                <button 
                  onClick={() => setIncludePrice(!includePrice)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${includePrice ? 'bg-orange-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includePrice ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Stylystyka Napisu</label>
                <select 
                  value={textStyle} 
                  onChange={(e) => setTextStyle(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500/50 transition"
                >
                  <option value="Minimalistyczny Badge" className="bg-black">Minimalistyczny Badge</option>
                  <option value="Elegancka Kursywa" className="bg-black">Elegancka Kursywa</option>
                  <option value="Bold Street-food" className="bg-black">Bold Street-food</option>
                  <option value="Premium Gold" className="bg-black">Premium Gold</option>
                </select>
              </div>
            </div>
          )}

          {/* AI Refinement - Co poprawić */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
             <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Korektor AI (Regeneracja)</label>
             <textarea 
               value={globalRefinement}
               onChange={(e) => setGlobalRefinement(e.target.value)}
               placeholder="Np: usuń cytrynę, zwiń ręcznik, dodaj więcej cieni..."
               className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none focus:border-orange-500/50 transition resize-none"
             />
             <p className="text-[8px] text-white/20 font-medium">Instrukcje zostaną uwzględnione przy następnym kliknięciu 'URUCHOM' lub 'RE-GENERUJ'.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Kąt Obiektywu</label>
              <select value={angle} onChange={(e) => setAngle(e.target.value as any)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500/50 transition">
                {ANGLES.map(a => <option key={a.id} value={a.id} className="bg-black">{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Format Zdjęcia</label>
              <select value={aspect} onChange={(e) => setAspect(e.target.value as any)} className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500/50 transition">
                <option value={AspectRatio.SQUARE_1_1} className="bg-black">1:1 Square</option>
                <option value={AspectRatio.PORTRAIT_4_5} className="bg-black">4:5 Insta</option>
                <option value={AspectRatio.STORY_9_16} className="bg-black">9:16 Story</option>
                <option value={AspectRatio.LANDSCAPE_16_9} className="bg-black">16:9 Cinema</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Stylistyka Tła</label>
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
               className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm shadow-2xl hover:bg-orange-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
             >
               {isSingleGenerating ? 'GENEROWANIE...' : (singleResult ? 'REGENERUJ Z POPRAWKĄ' : 'URUCHOM STUDIO AI')}
             </button>
          </div>
        )}
      </div>

      {/* Główny obszar roboczy */}
      <div className="flex-grow overflow-y-auto p-12 flex flex-col items-center bg-[radial-gradient(circle_at_center,_#1A1A1E_0%,_#0A0A0B_100%)]">
        {inputSource === 'MENU' ? (
          <div className="w-full max-w-6xl">
            {parsedDishes.length === 0 ? (
              <div className="bg-white/[0.03] backdrop-blur-3xl p-16 rounded-[60px] border border-white/10 flex flex-col items-center max-w-3xl mx-auto shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-orange-600 text-white rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-orange-600/20">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic text-center">Analiza Karty Menu</h2>
                <p className="text-gray-400 text-center mb-12 leading-relaxed text-lg font-medium">
                  Wklej tekst menu poniżej. AI rozpozna produkty i przygotuje studio do generowania serii zdjęć.
                </p>
                <textarea 
                  className="w-full h-64 p-8 bg-black/40 border border-white/10 rounded-[40px] text-white text-sm focus:ring-2 focus:ring-orange-600 outline-none transition resize-none mb-10 shadow-inner font-medium"
                  placeholder="Wklej menu, np:&#10;Burger Klasyk - 100% wołowina, pikle, sos - 39 zł&#10;Pizza Margherita - sos pomidorowy, mozzarella - 32 zł"
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                />
                <button 
                  onClick={handleParseMenu}
                  disabled={isParsing || !menuText.trim()}
                  className="w-full py-6 bg-white text-black font-black text-lg rounded-3xl hover:bg-orange-600 hover:text-white transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 shadow-2xl shadow-white/5"
                >
                  {isParsing ? (
                    <><div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div> ANALIZOWANIE...</>
                  ) : 'IMPORTUJ PRODUKTY Z MENU'}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">Produkty do Wygenerowania</h2>
                    <p className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Status: Tryb {mode}</p>
                  </div>
                  <button onClick={() => setParsedDishes([])} className="px-8 py-3 bg-white/5 text-white/40 font-black rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition uppercase text-[10px] tracking-widest">Zmień Menu</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {parsedDishes.map((dish) => (
                    <div key={dish.id} className="bg-white/5 rounded-[48px] overflow-hidden border border-white/10 flex flex-col group hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
                      <div className="aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden">
                        {dish.generatedImage ? (
                          <img src={dish.generatedImage} alt={dish.name} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
                        ) : (
                          <div className="text-center p-12 text-white/5">
                             <svg className="w-32 h-32 mx-auto mb-4 opacity-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                          </div>
                        )}
                        
                        {dish.isGenerating && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Tworzy Scenę...</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                           <button 
                             onClick={() => generateForDish(dish.id)}
                             disabled={dish.isGenerating}
                             className="w-full py-4 bg-white text-black font-black text-xs rounded-2xl hover:bg-orange-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-2xl"
                           >
                             {dish.generatedImage ? 'RE-GENERUJ (Z POPRAWKĄ)' : 'GENERUJ ZDJĘCIE'}
                           </button>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-black text-white leading-none uppercase tracking-tighter">{dish.name}</h4>
                          <span className="text-sm font-black text-orange-500 ml-4">{dish.price}</span>
                        </div>
                        
                        {/* Lokalne poprawki dla dania */}
                        <div className="mb-6">
                           <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Poprawka dla tej pozycji</label>
                           <input 
                             type="text"
                             value={dish.refinementPrompt || ''}
                             onChange={(e) => setParsedDishes(prev => prev.map(d => d.id === dish.id ? { ...d, refinementPrompt: e.target.value } : d))}
                             placeholder="Np. usuń pietruszkę..."
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:border-orange-500/50 outline-none"
                           />
                        </div>

                        {dish.generatedImage && (
                          <div className="mt-auto flex gap-3">
                             <button 
                               onClick={() => downloadImage(dish.generatedImage!, dish.name)}
                               className="flex-1 py-3 bg-white/5 text-white text-[9px] font-black rounded-xl hover:bg-white/10 transition uppercase tracking-widest"
                             >
                               Pobierz
                             </button>
                             <button className="flex-1 py-3 bg-white/10 text-orange-500 text-[9px] font-black rounded-xl hover:bg-white/20 transition uppercase tracking-widest">Zapisz</button>
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
          /* Pojedyncze zdjęcie - Premium View */
          <div className="w-full max-w-5xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-4">
                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Oryginalny Wsad</h3>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square bg-white/5 rounded-[60px] border-4 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/30 transition-all overflow-hidden group shadow-inner"
                 >
                   {uploadedImage ? (
                     <img src={uploadedImage} alt="Oryginał" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-center p-12">
                       <div className="w-20 h-20 bg-white/5 text-white/20 rounded-[32px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-500">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                       </div>
                       <p className="text-white font-black uppercase text-xs tracking-widest">Dodaj zdjęcie produktu</p>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Rezultat Studio AI</h3>
                 <div className={`aspect-square bg-white/5 rounded-[60px] border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl ${isSingleGenerating ? 'animate-pulse' : ''}`}>
                    {singleResult ? (
                      <img src={singleResult} alt="Wynik" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" />
                    ) : (
                      <div className="text-center opacity-10">
                        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                      </div>
                    )}
                    {isSingleGenerating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center">
                         <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                         <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Trwa Renderowanie...</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
            {singleResult && (
              <div className="mt-12 flex justify-center gap-6">
                 <button onClick={() => setSingleResult(null)} className="px-12 py-4 bg-white/5 text-white/40 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest">Odrzuć</button>
                 <button 
                   onClick={() => downloadImage(singleResult, 'studio-shot-food')}
                   className="px-16 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition active:scale-95 uppercase text-xs tracking-widest"
                 >
                   Pobierz Zdjęcie
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
