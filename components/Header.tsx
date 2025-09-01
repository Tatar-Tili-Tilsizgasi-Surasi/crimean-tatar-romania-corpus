import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Crimean Tatar (Romania) Language Corpus
      </h1>
      <p className="mt-3 text-lg text-slate-500">
        A collection of text entries for Crimean Tatar (Romania).
      </p>
    </header>
  );
};

export default Header;