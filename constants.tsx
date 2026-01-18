
import React from 'react';

export const BACKGROUND_PACKS = [
  { id: 'min-white', name: 'Minimal / Białe', tag: 'Minimalism, High-key', preview: 'https://picsum.photos/id/10/200/200' },
  { id: 'dark-premium', name: 'Ciemny premium', tag: 'Dark mode, Luxury', preview: 'https://picsum.photos/id/11/200/200' },
  { id: 'wood-table', name: 'Drewniany stół', tag: 'Rustic, Warm', preview: 'https://picsum.photos/id/12/200/200' },
  { id: 'marble', name: 'Marmur', tag: 'Elegant, Stone', preview: 'https://picsum.photos/id/13/200/200' },
  { id: 'street-food', name: 'Street food', tag: 'Urban, Contrast', preview: 'https://picsum.photos/id/14/200/200' },
  { id: 'fit-box', name: 'Fit / Lunchbox', tag: 'Clean, Healthy', preview: 'https://picsum.photos/id/15/200/200' },
  { id: 'scandinavian', name: 'Skandynawskie', tag: 'Soft, Nordic', preview: 'https://picsum.photos/id/16/200/200' },
  { id: 'xmas', name: 'Świąteczne', tag: 'Holiday, Cozy', preview: 'https://picsum.photos/id/17/200/200' },
];

export const PLANS = [
  { id: 'starter', name: 'Starter', price: 19, limit: '50 zdjęć/mies.', features: ['30 podstawowych teł', 'Tryb Menu', 'Eksport PNG HD'] },
  { id: 'pro', name: 'Restaurant Pro', price: 49, limit: '250 zdjęć/mies.', features: ['Wszystkie tła premium', 'Batch Mode (4 ujęcia)', 'Usuwanie logo z tła', 'Priorytet GPU'] },
  { id: 'agency', name: 'Enterprise', price: 149, limit: '1000 zdjęć/mies.', features: ['Nielimitowane style', 'Wsparcie dedykowane', 'Dostęp do API', 'Paczki ZIP'] },
];

export const ANGLES = [
  { id: 'TOP_DOWN', label: 'Z góry (Flatlay)', icon: '📐' },
  { id: 'HERO_45', label: 'Hero 45°', icon: '📸' },
  { id: 'SIDE', label: 'Z boku (Eye-level)', icon: '🖼️' },
  { id: 'MACRO', label: 'Detal (Macro)', icon: '🔍' },
  { id: 'BATCH_4', label: 'Seria 4 ujęć (Batch)', icon: '📦' },
];
