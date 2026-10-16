import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);
const KEY = 'nemachin_favs';

export function FavoritesProvider({ children }) {
  const [favs, setFavs] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favs));
    } catch {
      /* storage unavailable */
    }
  }, [favs]);

  const toggle = (code) =>
    setFavs((list) =>
      list.includes(code) ? list.filter((c) => c !== code) : [code, ...list]
    );

  const isFav = (code) => favs.includes(code);

  return (
    <FavoritesContext.Provider value={{ favs, toggle, isFav }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
