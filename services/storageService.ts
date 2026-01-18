
import { StyleTemplate, SavedGeneration, User } from '../types';

const KEYS = {
  USER: 'foodshot_user',
  TEMPLATES: 'foodshot_templates',
  LIBRARY: 'foodshot_library',
  HISTORY: 'foodshot_history'
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.USER);
  },
  
  getTemplates: (): StyleTemplate[] => {
    const data = localStorage.getItem(KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  },
  saveTemplate: (template: StyleTemplate) => {
    const templates = storage.getTemplates();
    templates.push(template);
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },
  deleteTemplate: (id: string) => {
    const templates = storage.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  getLibrary: (): SavedGeneration[] => {
    const data = localStorage.getItem(KEYS.LIBRARY);
    return data ? JSON.parse(data) : [];
  },
  saveToLibrary: (item: SavedGeneration) => {
    const lib = storage.getLibrary();
    lib.unshift(item); // Newest first
    localStorage.setItem(KEYS.LIBRARY, JSON.stringify(lib));
    
    // Update user stats
    const user = storage.getUser();
    if (user) {
      user.generationsCount += 1;
      storage.setUser(user);
    }
  },
  removeFromLibrary: (id: string) => {
    const lib = storage.getLibrary().filter(item => item.id !== id);
    localStorage.setItem(KEYS.LIBRARY, JSON.stringify(lib));
  }
};
