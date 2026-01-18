
import React from 'react';
import { AppMode } from '../types';

export const Dashboard: React.FC<{ setMode: (m: AppMode) => void }> = ({ setMode }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Witaj ponownie, Głodny Wilk! 👋</h1>
          <p className="text-gray-500">Oto przegląd Twojej aktywności w tym miesiącu.</p>
        </div>
        <button 
          onClick={() => setMode(AppMode.STUDIO)}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-orange-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Nowa Seria Zdjęć
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Wykorzystano limit</p>
          <p className="text-2xl font-bold">231 / 400</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '58%' }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Aktywne szablony</p>
          <p className="text-2xl font-bold">4</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Dania w bibliotece</p>
          <p className="text-2xl font-bold">42</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Oszczędzony czas</p>
          <p className="text-2xl font-bold text-green-600">~12h</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Ostatnie generacje</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="aspect-square bg-gray-200 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200">
            <img src={`https://picsum.photos/seed/last-${i}/400/400`} alt="Recent" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button className="p-2 bg-white rounded-full text-gray-900 hover:text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
