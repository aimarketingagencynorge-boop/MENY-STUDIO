
import React, { useState, useEffect } from 'react';
import { AppMode, User, StyleTemplate, PhotoAngle, AspectRatio, SavedGeneration } from './types';
import { Layout } from './components/Layout';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { Studio } from './components/Studio';
import { Login } from './components/Login';
import { storage } from './services/storageService';
import { BACKGROUND_PACKS } from './constants';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<StyleTemplate[]>([]);
  const [library, setLibrary] = useState<SavedGeneration[]>([]);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) setUser(savedUser);
    
    setTemplates(storage.getTemplates());
    setLibrary(storage.getLibrary());
  }, [currentMode]);

  const handleCreateTemplate = () => {
    const newTemp: StyleTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nowy Styl ${templates.length + 1}`,
      backgroundId: 'marble',
      lightingStyle: 'Studyjne Miękkie',
      focusStyle: 'Rozmyte tło (Bokeh)',
      angle: PhotoAngle.HERO_45,
      aspectRatio: AspectRatio.SQUARE_1_1
    };
    storage.saveTemplate(newTemp);
    setTemplates(storage.getTemplates());
  };

  const handleDeleteTemplate = (id: string) => {
    storage.deleteTemplate(id);
    setTemplates(storage.getTemplates());
  };

  const handleRemoveFromLibrary = (id: string) => {
    storage.removeFromLibrary(id);
    setLibrary(storage.getLibrary());
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentMode(AppMode.DASHBOARD);
  };

  const handleLogout = () => {
    storage.setUser(null);
    setUser(null);
    setCurrentMode(AppMode.LANDING);
  };

  const renderContent = () => {
    // If not logged in and not on Landing, show login
    if (!user && currentMode !== AppMode.LANDING) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentMode) {
      case AppMode.LANDING:
        return <Landing onStart={() => {
          if (user) setCurrentMode(AppMode.DASHBOARD);
          else setCurrentMode(AppMode.LOGIN);
          window.scrollTo(0, 0);
        }} />;
      case AppMode.LOGIN:
        return <Login onLogin={handleLogin} />;
      case AppMode.DASHBOARD:
        return <Dashboard setMode={setCurrentMode} />;
      case AppMode.STUDIO:
        return <Studio />;
      case AppMode.TEMPLATES:
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 text-white animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-2">Moje Style Serii</h2>
                <p className="text-gray-500 font-medium text-lg">Zapisuj ulubione konfiguracje tła i światła, aby utrzymać spójność menu.</p>
              </div>
              <button 
                onClick={handleCreateTemplate}
                className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-orange-700 transition active:scale-95 shadow-xl shadow-orange-600/20"
              >
                Nowy Szablon Stylu
              </button>
            </div>
            
            {templates.length === 0 ? (
              <div className="p-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[60px] text-center">
                 <p className="text-gray-600 font-black uppercase text-xs tracking-widest">Brak zapisanych stylów. Stwórz swój pierwszy "Style Lock".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {templates.map((t) => (
                  <div key={t.id} className="bg-white/5 p-10 rounded-[60px] border border-white/10 hover:border-orange-500/30 transition-all group">
                    <div className="w-full h-48 bg-black/40 rounded-[40px] mb-8 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                       <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 bg-black/50 px-4 py-2 rounded-full border border-orange-500/20">{t.aspectRatio} • {t.angle}</span>
                    </div>
                    <h3 className="font-black text-2xl mb-2 uppercase tracking-tighter italic">{t.name}</h3>
                    <div className="space-y-1 mb-10">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tło: {BACKGROUND_PACKS.find(b => b.id === t.backgroundId)?.name || t.backgroundId}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Oświetlenie: {t.lightingStyle}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button onClick={() => setCurrentMode(AppMode.STUDIO)} className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Użyj w Studio →</button>
                      <button onClick={() => handleDeleteTemplate(t.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case AppMode.LIBRARY:
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 text-white animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-2">Biblioteka Dan</h2>
                <p className="text-gray-500 font-medium text-lg">Wszystkie Twoje profesjonalne ujęcia AI w jednym miejscu.</p>
              </div>
              <div className="w-full md:w-auto flex gap-4">
                <input type="text" placeholder="Szukaj potrawy..." className="flex-grow px-8 py-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-orange-600 transition text-white text-sm" />
              </div>
            </div>

            {library.length === 0 ? (
              <div className="p-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[60px] text-center">
                 <p className="text-gray-600 font-black uppercase text-xs tracking-widest mb-10">Brak zapisanych dań. Zacznij w Studio AI.</p>
                 <button onClick={() => setCurrentMode(AppMode.STUDIO)} className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all uppercase italic text-sm">Otwórz Studio</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {library.map((item) => (
                  <div key={item.id} className="group flex flex-col">
                    <div className="aspect-square bg-white/5 rounded-[40px] overflow-hidden border border-white/5 transition-all group-hover:border-orange-500/50 group-hover:-translate-y-4 duration-500 relative shadow-xl">
                      <img src={item.imageUrl} alt={item.dishName} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                         <button onClick={() => window.open(item.imageUrl)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-orange-600 hover:text-white transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></button>
                         <button onClick={() => handleRemoveFromLibrary(item.id)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </div>
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-black/60 backdrop-blur text-[8px] font-black uppercase text-orange-500 rounded-full border border-orange-500/20">{item.mode}</span>
                      </div>
                    </div>
                    <div className="mt-6 px-4">
                      <p className="text-sm font-black text-white uppercase tracking-tighter italic">{item.dishName}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case AppMode.BILLING:
        const currentPlan = user?.plan || 'pro';
        const planPrice = currentPlan === 'starter' ? 19 : currentPlan === 'pro' ? 49 : 149;
        const generations = user?.generationsCount || 0;
        const limit = currentPlan === 'starter' ? 50 : currentPlan === 'pro' ? 250 : 1000;

        return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-white animate-in fade-in duration-500">
            <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Plan i Subskrypcja</h2>
            <div className="bg-white/[0.02] p-12 rounded-[60px] border border-white/10 shadow-2xl">
               <div className="flex justify-between items-center mb-12 pb-12 border-b border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Aktualny model rozliczeniowy</p>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">{currentPlan === 'starter' ? 'Starter' : currentPlan === 'pro' ? 'Restaurant Pro' : 'Enterprise'}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter">${planPrice}<span className="text-lg text-gray-500">/m</span></p>
                    <p className="text-[10px] text-gray-500 font-black uppercase mt-2">Faktura co 30 dni</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h4 className="font-black text-white/40 mb-8 uppercase text-[10px] tracking-widest">Wykorzystanie zasobów</h4>
                    <div className="space-y-8">
                       <div>
                         <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-widest">
                           <span>Generacje AI</span>
                           <span className="text-orange-500">{generations} / {limit}</span>
                         </div>
                         <div className="w-full bg-white/5 rounded-full h-3">
                           <div className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]" style={{ width: `${(generations/limit)*100}%` }}></div>
                         </div>
                       </div>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">Limit odświeża się za 12 dni. Subskrypcja opłacona kartą zakończąną na **** 4242.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                     <button className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95 text-sm uppercase italic tracking-tighter">Zmień Pakiet</button>
                     <button className="w-full py-5 bg-white/5 text-white/60 font-black rounded-2xl border border-white/10 hover:bg-white/10 transition text-xs uppercase tracking-widest">Historia Faktur</button>
                     <button 
                       onClick={handleLogout}
                       className="w-full py-5 text-red-500/40 font-black hover:text-red-500 transition text-[9px] uppercase tracking-[0.3em] mt-6"
                     >
                       Wyloguj Się i Wyjdź
                     </button>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-40 text-white">
             <h2 className="text-4xl font-black mb-8 tracking-tighter italic uppercase">Podróż przerwana.</h2>
             <button onClick={() => setCurrentMode(AppMode.LANDING)} className="px-12 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-2xl">Wróć do startu</button>
          </div>
        );
    }
  };

  return (
    <Layout currentMode={currentMode} setMode={setCurrentMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;
