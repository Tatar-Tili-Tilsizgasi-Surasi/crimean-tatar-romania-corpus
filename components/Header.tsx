import React from 'react';
import Menu from './Menu';

type Page = 'corpus' | 'howto' | 'about' | 'sources';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="relative text-center">
      <div className="absolute top-0 left-0">
          <Menu onNavigate={onNavigate} />
      </div>
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 pt-2">
        Crimean Tatar (Romania) Language Corpus
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-600">
        A collection of text entries for Crimean Tatar (Romania).
      </p>
    </header>
  );
};

export default Header;