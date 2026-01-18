
import React from 'react';
import { AppMode, User } from '../types';
import { storage } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode }) => {
  const isLanding = currentMode === AppMode.LANDING;
  const user = storage.getUser();

  const handleNavClick = (mode: AppMode, sectionId?: string) => {
    if (sectionId) {
      if (currentMode !== AppMode.LANDING) {
        setMode(AppMode.LANDING);
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setMode(mode);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white selection:bg-orange-500 selection:text-white">
      <nav className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div 
              className="flex items-center gap-4 cursor-pointer group" 
              onClick={() => handleNavClick(AppMode.LANDING)}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter uppercase leading-none italic">StudioShot</span>
                <span className="text-[10px] text-orange-500 font-bold tracking-[0.3em] uppercase mt-1">SaaS Food Photo AI</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-12">
              {isLanding ? (
                <>
                  <button onClick={() => handleNavClick(AppMode.LANDING, 'features')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Technologia</button>
                  <button onClick={() => handleNavClick(AppMode.LANDING, 'pricing')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Pakiety</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNavClick(AppMode.DASHBOARD)} className={`text-[10px] font-black uppercase tracking-widest transition ${currentMode === AppMode.DASHBOARD ? 'text-orange-500' : 'text-gray-500 hover:text-white'}`}>Panel Główny</button>
                  <button onClick={() => handleNavClick(AppMode.STUDIO)} className={`text-[10px] font-black uppercase tracking-widest transition ${currentMode === AppMode.STUDIO ? 'text-orange-500' : 'text-gray-500 hover:text-white'}`}>Studio Pro</button>
                  <button onClick={() => handleNavClick(AppMode.TEMPLATES)} className={`text-[10px] font-black uppercase tracking-widest transition ${currentMode === AppMode.TEMPLATES ? 'text-orange-500' : 'text-gray-500 hover:text-white'}`}>Style Serii</button>
                  <button onClick={() => handleNavClick(AppMode.LIBRARY)} className={`text-[10px] font-black uppercase tracking-widest transition ${currentMode === AppMode.LIBRARY ? 'text-orange-500' : 'text-gray-500 hover:text-white'}`}>Biblioteka</button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {(!user || isLanding) ? (
                <button 
                  onClick={() => handleNavClick(user ? AppMode.DASHBOARD : AppMode.LOGIN)}
                  className="bg-white text-black px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95 uppercase italic tracking-tighter"
                >
                  {user ? 'Panel Klienta' : 'Zacznij Teraz'}
                </button>
              ) : (
                <div 
                  className="flex items-center gap-4 cursor-pointer group bg-white/5 p-1.5 pr-6 rounded-2xl border border-white/10 hover:bg-white/10 transition"
                  onClick={() => handleNavClick(AppMode.BILLING)}
                >
                   <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-lg shadow-inner italic">
                     {user.companyName.charAt(0)}
                   </div>
                   <div className="hidden sm:block">
                     <p className="text-[10px] font-black uppercase text-white/90 leading-none mb-1">{user.companyName}</p>
                     <p className="text-[8px] text-orange-500 font-bold uppercase tracking-widest">{user.plan.toUpperCase()} • {user.generationsCount} / {user.plan === 'starter' ? 50 : 250} zdjęć</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-black py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 font-black italic">S</div>
            <span className="text-xl font-black uppercase tracking-tighter italic">StudioShot AI</span>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-10 max-w-lg mx-auto leading-relaxed">System profesjonalnej fotografii produktowej dla gastronomii zasilany przez najnowocześniejsze modele generatywne.</p>
          <div className="flex justify-center gap-8 mb-10">
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Regulamin</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Polityka Prywatności</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Pomoc</a>
          </div>
          <p className="text-gray-800 text-[10px] font-black uppercase tracking-[0.5em]">© 2025 StudioShot AI Technology</p>
        </div>
      </footer>
    </div>
  );
};
