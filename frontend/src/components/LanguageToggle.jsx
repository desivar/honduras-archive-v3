import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={() => i18n.changeLanguage('en')}
        style={{
          padding: '4px 10px',
          backgroundColor: i18n.language === 'en' ? '#ACA37E' : 'rgba(255,255,255,0.2)',
          color: '#EFE7DD',
          border: '1px solid #ACA37E',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: i18n.language === 'en' ? 'bold' : 'normal'
        }}
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage('es')}
        style={{
          padding: '4px 10px',
          backgroundColor: i18n.language === 'es' ? '#ACA37E' : 'rgba(255,255,255,0.2)',
          color: '#EFE7DD',
          border: '1px solid #ACA37E',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: i18n.language === 'es' ? 'bold' : 'normal'
        }}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageToggle;