import { useEffect, useState } from 'react';

const getInitialLang = (defaultLang = 'ko') => {
  if (typeof window === 'undefined') return defaultLang;
  return localStorage.getItem('lang') || defaultLang;
};

const useLang = (defaultLang = 'ko') => {
  const [lang, setLang] = useState(() => getInitialLang(defaultLang));

  useEffect(() => {
    const handleLangChange = (event) => {
      setLang(event.detail.lang);
    };

    window.addEventListener('langChange', handleLangChange);
    return () => window.removeEventListener('langChange', handleLangChange);
  }, []);

  return lang;
};

export default useLang;









