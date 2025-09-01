import React, { useState, useRef, useEffect } from 'react';
import Keyboard from './Keyboard';

const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const KeyboardIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface CorpusControlsProps {
  entryCount: number;
  totalCount: number;
  totalWordCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportJson: () => void;
  onExportTxt: () => void;
  showTranslations: boolean;
  onShowTranslationsChange: (show: boolean) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CorpusControls: React.FC<CorpusControlsProps> = ({
  entryCount,
  totalCount,
  totalWordCount,
  searchQuery,
  onSearchChange,
  onExportJson,
  onExportTxt,
  showTranslations,
  onShowTranslationsChange,
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const showFilteredCount = searchQuery || selectedCategory !== 'All' || entryCount !== totalCount;

  const handleKeyPress = (char: string) => {
    onSearchChange(searchQuery + char);
  };

  const handleBackspace = () => {
    onSearchChange(searchQuery.slice(0, -1));
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuRef]);

  const handleExportClick = (exportFunc: () => void) => {
    exportFunc();
    setIsExportMenuOpen(false);
  };
  
  return (
    <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-slate-200">
      <div>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </span>
            <input
                type="search"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search corpus entries"
                className="w-full p-2 pl-10 pr-12 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
            <button
                onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-cyan-400 transition-colors rounded-r-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                aria-label={isKeyboardVisible ? "Hide keyboard" : "Show keyboard"}
                aria-expanded={isKeyboardVisible}
            >
                <KeyboardIcon className="h-5 w-5" />
            </button>
        </div>
        {isKeyboardVisible && (
          <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
        )}
      </div>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-slate-700 flex flex-col sm:flex-row flex-wrap items-center justify-center text-center sm:text-left sm:justify-start gap-x-4 gap-y-2">
            <div className="text-base font-semibold">
                {showFilteredCount ? (
                    <>
                    Showing <span className="text-cyan-400">{entryCount.toLocaleString()}</span> of {totalCount.toLocaleString()} entries
                    </>
                ) : (
                    <>
                    Total Entries: <span className="text-cyan-400">{totalCount.toLocaleString()}</span>
                    </>
                )}
            </div>
            <div className="hidden sm:block text-slate-400 font-light">|</div>
            <div className="text-base font-semibold">
                Total Words: <span className="text-cyan-400">{totalWordCount.toLocaleString()}</span>
            </div>
        </div>
        <div className="flex items-center flex-wrap justify-center lg:justify-end gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label htmlFor="category-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-slate-200 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <label htmlFor="show-translations" className="flex items-center cursor-pointer select-none">
            <span className="mr-3 text-sm font-medium text-slate-700 whitespace-nowrap">Show Translations</span>
            <div className="relative">
                <input
                    type="checkbox"
                    id="show-translations"
                    className="sr-only peer"
                    checked={showTranslations}
                    onChange={(e) => onShowTranslationsChange(e.target.checked)}
                    aria-label="Show or hide translations"
                />
                <div className="block bg-slate-300 w-12 h-7 rounded-full peer-checked:bg-cyan-600 transition-colors"></div>
                <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
            </div>
          </label>
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors"
              aria-haspopup="true"
              aria-expanded={isExportMenuOpen}
              aria-label="Export options"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
              <ChevronDownIcon className="h-4 w-4" />
            </button>
             {isExportMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10 animate-fade-in-fast"
                  role="menu"
                >
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleExportClick(onExportJson); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    Export JSON
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleExportClick(onExportTxt); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    Export TXT
                  </a>
                  <p className="text-xs text-slate-500 px-4 pt-2 pb-1 border-t border-slate-100">
                    {showTranslations ? 'Includes translations.' : 'Excludes translations.'}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorpusControls;