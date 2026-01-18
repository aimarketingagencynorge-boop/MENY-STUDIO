
import React from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, setMode }) => {
  const isLanding = currentMode === AppMode.LANDING;

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
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      {/* Dynamic Navigation */}
      <nav className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => handleNavClick(AppMode.LANDING)}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-none">StudioShot</span>
                <span className="text-[10px] text-orange-500 font-bold tracking-[0.2em] uppercase">Food AI SaaS</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-10">
              {isLanding ? (
                <>
                  <button onClick={() => handleNavClick(AppMode.LANDING, 'features')} className="text-sm font-bold text-gray-400 hover:text-white transition">Technologia</button>
                  <button onClick={() => handleNavClick(AppMode.LANDING, 'pricing')} className="text-sm font-bold text-gray-400 hover:text-white transition">Cennik</button>
                  <button onClick={() => handleNavClick(AppMode.DASHBOARD)} className="text-sm font-bold text-gray-400 hover:text-white transition">Demo</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNavClick(AppMode.DASHBOARD)} className={`text-sm font-bold transition ${currentMode === AppMode.DASHBOARD ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}>Panel</button>
                  <button onClick={() => handleNavClick(AppMode.STUDIO)} className={`text-sm font-bold transition ${currentMode === AppMode.STUDIO ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}>Studio AI</button>
                  <button onClick={() => handleNavClick(AppMode.TEMPLATES)} className={`text-sm font-bold transition ${currentMode === AppMode.TEMPLATES ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}>Moje Style</button>
                  <button onClick={() => handleNavClick(AppMode.LIBRARY)} className={`text-sm font-bold transition ${currentMode === AppMode.LIBRARY ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}>Dania</button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isLanding ? (
                <button 
                  onClick={() => handleNavClick(AppMode.DASHBOARD)}
                  className="bg-white text-black px-7 py-2.5 rounded-full font-black text-sm hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Otwórz Studio
                </button>
              ) : (
                <div 
                  className="flex items-center gap-3 cursor-pointer group bg-white/5 p-1.5 pr-4 rounded-full border border-white/10 hover:bg-white/10 transition"
                  onClick={() => handleNavClick(AppMode.BILLING)}
                >
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                     GW
                   </div>
                   <div className="hidden sm:block">
                     <p className="text-[10px] font-black uppercase text-white/80">Rest. Głodny Wilk</p>
                     <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Plan Pro • 231/400</p>
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
    </div>
  );
};
