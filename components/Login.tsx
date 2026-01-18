
import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storageService';

export const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      companyName: company || 'Twoja Restauracja',
      plan: 'pro',
      generationsCount: 0
    };
    storage.setUser(mockUser);
    onLogin(mockUser);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-2">
            {isRegister ? 'Dołącz do StudioShot' : 'Witaj ponownie'}
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            {isRegister ? 'Zacznij generować profesjonalne zdjęcia menu' : 'Zaloguj się do swojego panelu restauracji'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block px-2">Nazwa Lokalu</label>
              <input 
                required
                type="text" 
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Np. Restauracja Głodny Wilk" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-600 transition" 
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block px-2">Email Służbowy</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="biuro@twoja-restauracja.pl" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-600 transition" 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block px-2">Hasło</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-600 transition" 
            />
          </div>

          <button className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all transform active:scale-95 shadow-xl uppercase italic tracking-tighter">
            {isRegister ? 'Utwórz Konto' : 'Zaloguj Się'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-gray-500 hover:text-orange-500 font-bold uppercase tracking-widest transition"
          >
            {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Wypróbuj za darmo'}
          </button>
        </div>
      </div>
    </div>
  );
};
