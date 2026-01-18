
import React, { useEffect, useState } from 'react';
import { AppMode, User, SavedGeneration } from '../types';
import { storage } from '../services/storageService';

export const Dashboard: React.FC<{ setMode: (m: AppMode) => void }> = ({ setMode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [recent, setRecent] = useState<SavedGeneration[]>([]);
  const [templatesCount, setTemplatesCount] = useState(0);

  useEffect(() => {
    setUser(storage.getUser());
    setRecent(storage.getLibrary().slice(0, 5));
    setTemplatesCount(storage.getTemplates().length);
  }, []);

  if (!user) return null;

  const planLimit = user.plan === 'starter' ? 50 : user.plan === 'pro' ? 250 : 1000;
  const progress = (user.generationsCount / planLimit) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Witaj, {user.companyName}! 👋</h1>
          <p className="text-gray-500 font-medium mt-1">Twój system profesjonalnej fotografii AI jest gotowy.</p>
        </div>
        <button 
          onClick={() => setMode(AppMode.STUDIO)}
          className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:bg-orange-700 transition-all active:scale-95 uppercase italic tracking-tighter"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Uruchom Studio AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[40px] group hover:border-orange-500/30 transition-all">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Wykorzystany Limit</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-black italic tracking-tighter">{user.generationsCount}</span>
            <span className="text-gray-600 font-black text-xl">/ {planLimit}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">Plan {user.plan.toUpperCase()}</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[40px] group hover:border-orange-500/30 transition-all">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Aktywne Style</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black italic tracking-tighter">{templatesCount}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Spójne szablony Twojego brandu.</p>
          <button onClick={() => setMode(AppMode.TEMPLATES)} className="mt-8 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Zarządzaj Stylami →</button>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[40px] group hover:border-orange-500/30 transition-all">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Biblioteka Dań</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black italic tracking-tighter">{recent.length}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Gotowe grafiki do pobrania.</p>
          <button onClick={() => setMode(AppMode.LIBRARY)} className="mt-8 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Otwórz Bibliotekę →</button>
        </div>
      </div>

      <h2 className="text-2xl font-black mb-8 tracking-tighter uppercase italic flex items-center gap-3">
        <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
        Ostatnie Prace
      </h2>
      
      {recent.length === 0 ? (
        <div className="p-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[60px] text-center">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
           </div>
           <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-8">Nie masz jeszcze żadnych zdjęć w bibliotece.</p>
           <button 
             onClick={() => setMode(AppMode.STUDIO)}
             className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition uppercase text-[10px] tracking-widest"
           >
             Stwórz pierwsze ujęcie
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {recent.map(item => (
            <div key={item.id} className="aspect-square bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 hover:border-orange-500/50 transition-all duration-500">
              <img src={item.imageUrl} alt={item.dishName} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                 <button 
                   onClick={() => window.open(item.imageUrl)}
                   className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-orange-600 hover:text-white transition"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
