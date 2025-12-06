
import React, { useState, useRef, useEffect } from 'react';

type Page = 'corpus' | 'howto' | 'about' | 'sources' | 'translator' | 'keyboard';

interface MenuProps {
  onNavigate: (page: Page) => void;
}

const MenuIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Menu: React.FC<MenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNavigation = (page: Page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="main-menu"
      >
        {isOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div 
          id="main-menu"
          className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10 animate-fade-in-fast text-left"
          role="menu"
        >
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('corpus'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            Corpus
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('translator'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100 font-medium text-cyan-600"
            role="menuitem"
          >
            Translator (Beta)
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('keyboard'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100 font-medium text-indigo-600"
            role="menuitem"
          >
            Keyboard App
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('sources'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            Sources
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('howto'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            How to use
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            About
          </a>
        </div>
      )}
    </div>
  );
};

export default Menu;
