
import React, { useState } from 'react';
import { AppMode } from './types';
import { Layout } from './components/Layout';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { Studio } from './components/Studio';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.LANDING);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.LANDING:
        return <Landing onStart={() => {
          setCurrentMode(AppMode.DASHBOARD);
          window.scrollTo(0, 0);
        }} />;
      case AppMode.DASHBOARD:
        return <Dashboard setMode={setCurrentMode} />;
      case AppMode.STUDIO:
        return <Studio />;
      case AppMode.TEMPLATES:
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 text-white">
            <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Moje Style</h2>
            <p className="text-gray-500 font-medium mb-12 text-lg">Zapisuj ulubione konfiguracje oświetlenia i tła.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-12 border-4 border-dashed border-white/5 rounded-[60px] flex flex-col items-center justify-center text-gray-700 hover:border-orange-500/30 transition-all group cursor-pointer bg-white/[0.02]">
                <div className="w-16 h-16 bg-white/5 text-white/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                </div>
                <p className="font-black text-white/20 uppercase tracking-[0.2em] text-xs">Nowy Szablon</p>
              </div>
              {['Karta Główna Pro', 'Instagram Moody'].map((t, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[60px] border border-white/10 hover:border-orange-500/30 transition-all duration-500">
                  <div className="w-full h-48 bg-black/40 rounded-[40px] mb-8 overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/temp-${i}/600/400`} alt="Style" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">1:1 Square</span>
                    </div>
                  </div>
                  <h3 className="font-black text-2xl mb-2 text-white uppercase tracking-tighter italic">{t}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8">Oświetlenie: Studyjne • Tło: Marmur</p>
                  <button className="text-orange-500 text-xs font-black uppercase tracking-widest hover:text-white transition">Konfiguruj Style →</button>
                </div>
              ))}
            </div>
          </div>
        );
      case AppMode.LIBRARY:
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <div>
                <h2 className="text-5xl font-black tracking-tighter mb-2 uppercase italic">Biblioteka Dań</h2>
                <p className="text-gray-500 font-medium text-lg">Zarządzaj swoją wizualną kartą menu.</p>
              </div>
              <div className="w-full md:w-auto flex gap-4">
                <input type="text" placeholder="Szukaj potrawy..." className="flex-grow px-8 py-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-orange-500 transition text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-square bg-white/5 rounded-[40px] overflow-hidden border border-white/5 transition-all group-hover:border-orange-500/50 group-hover:-translate-y-4 duration-500">
                    <img src={`https://picsum.photos/seed/lib-${i}/500/500`} alt="Dish" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-6 px-2 text-center">
                    <p className="text-sm font-black text-white uppercase tracking-tighter">Produkt #{i + 101}</p>
                    <p className="text-[9px] text-orange-500 font-black uppercase tracking-[0.2em] mt-1">Status: Gotowe</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case AppMode.BILLING:
        return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-white">
            <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase italic">Subskrypcja</h2>
            <div className="bg-white/5 p-12 rounded-[60px] border border-white/10">
               <div className="flex justify-between items-center mb-12 pb-12 border-b border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Twój aktualny plan</p>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase">Restaurant Pro</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter">$49<span className="text-lg text-gray-500">/m</span></p>
                    <p className="text-[10px] text-gray-500 font-black uppercase mt-2">Billed Monthly</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div>
                    <h4 className="font-black text-white/40 mb-8 uppercase text-[10px] tracking-widest">Wykorzystanie zasobów</h4>
                    <div className="space-y-8">
                       <div>
                         <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-widest">
                           <span>Generacje AI</span>
                           <span className="text-orange-500">231 / 400</span>
                         </div>
                         <div className="w-full bg-white/5 rounded-full h-2">
                           <div className="bg-orange-600 h-2 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" style={{ width: '58%' }}></div>
                         </div>
                       </div>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">Limit odświeża się automatycznie za 14 dni. Generacje niewykorzystane nie przechodzą na kolejny miesiąc.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                     <button className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 text-sm uppercase italic tracking-tighter">Zmień na Enterprise ($149)</button>
                     <button className="w-full py-5 bg-white/5 text-white/60 font-black rounded-2xl border border-white/10 hover:bg-white/10 transition text-xs uppercase tracking-widest">Pobierz faktury</button>
                     <button className="w-full py-5 text-red-900 font-black hover:text-red-600 transition text-[9px] uppercase tracking-[0.3em] mt-6">Zakończ subskrypcję</button>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-40 text-white">
             <h2 className="text-4xl font-black mb-8 tracking-tighter italic uppercase">Podróż przerwana.</h2>
             <button onClick={() => setCurrentMode(AppMode.LANDING)} className="px-12 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-2xl">Wróć na orbitę</button>
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
