
import React from 'react';

const PRICING_PLANS = [
  { id: 'starter', name: 'Starter', price: 19, limit: '50 zdjęć/mies.', description: 'Idealny dla małych kawiarni', features: ['30 podstawowych teł', 'Tryb Menu', 'Eksport PNG HD'] },
  { id: 'pro', name: 'Restaurant Pro', price: 49, limit: '250 zdjęć/mies.', description: 'Dla aktywnej restauracji', features: ['Wszystkie tła premium', 'Batch Mode (4 ujęcia)', 'Usuwanie logo z tła', 'Priorytet GPU'] },
  { id: 'agency', name: 'Enterprise', price: 149, limit: '1000 zdjęć/mies.', description: 'Dla agencji i cateringów', features: ['Nielimitowane style', 'Wsparcie dedykowane', 'Dostęp do API', 'Paczki ZIP'] },
];

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="bg-[#0A0A0B]">
      {/* High-End Hero */}
      <section className="relative pt-32 pb-44 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Nowy model Gemini 2.5 Flash Image dostępny</span>
          </div>
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] mb-12">
            SESJA FOTO <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">BEZ FOTOGRAFA.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium mb-16">
            Wgraj surowe zdjęcie z kuchni. Wybierz styl. Pobierz profesjonalne zdjęcia do Menu i Social Media w 5 sekund.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={onStart}
              className="px-12 py-6 bg-white text-black rounded-2xl text-xl font-black hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 shadow-2xl shadow-white/5"
            >
              Uruchom Studio
            </button>
            <button className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl text-xl font-bold hover:bg-white/10 transition">
              Przykłady AI
            </button>
          </div>
        </div>
      </section>

      {/* Pricing - Corrected IDs and Content */}
      <section id="pricing" className="py-40 bg-black scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black tracking-tighter mb-4">Wybierz swój pakiet mocy.</h2>
            <p className="text-gray-500 font-medium">Koszty generacji AI oparte o Twoje realne potrzeby.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.id} className={`p-10 rounded-[40px] border-2 transition-all group ${plan.id === 'pro' ? 'border-orange-500 bg-orange-500/5 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] scale-105' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                <h3 className="text-2xl font-black mb-1 tracking-tight">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-8 font-bold uppercase tracking-widest">{plan.description}</p>
                <div className="flex items-baseline mb-10">
                  <span className="text-5xl font-black">${plan.price}</span>
                  <span className="text-gray-500 font-bold ml-2">/mies.</span>
                </div>
                <div className="mb-10 p-4 bg-white/5 rounded-2xl">
                  <p className="text-sm font-black text-orange-500 uppercase tracking-widest mb-1">Limit</p>
                  <p className="text-xl font-black">{plan.limit}</p>
                </div>
                <ul className="space-y-4 mb-12">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onStart}
                  className={`w-full py-5 rounded-2xl font-black transition-all ${plan.id === 'pro' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Wybierz {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Section */}
      <section id="features" className="py-40 bg-[#0A0A0B] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Bez kompromisów</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-8">
              Autentyczność <br/>
              ponad wszystko.
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-10">
              Nasze AI nie "wymyśla" Twojego jedzenia. My tylko budujemy profesjonalne studio dookoła Twojego talerza. Oświetlenie, cienie i tekstury są dobierane tak, by klient nie odróżnił zdjęcia od sesji za 5000 zł.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 font-black">01</div>
                <div>
                  <h4 className="font-bold mb-1">Brak halucynacji</h4>
                  <p className="text-sm text-gray-500">Danie pozostaje identyczne z oryginałem.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 font-black">02</div>
                <div>
                  <h4 className="font-bold mb-1">Spójność serii</h4>
                  <p className="text-sm text-gray-500">Całe menu wygląda jak robione w jednym dniu.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-transparent rounded-[60px] border border-white/10 p-8">
                <img src="https://picsum.photos/seed/tech/800/800" className="w-full h-full object-cover rounded-[40px] shadow-2xl" alt="AI Logic" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};
