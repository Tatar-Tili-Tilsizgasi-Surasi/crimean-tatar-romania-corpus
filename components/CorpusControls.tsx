import React, { useState } from 'react';
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
  const showFilteredCount = searchQuery || selectedCategory !== 'All' || entryCount !== totalCount;

  const handleKeyPress = (char: string) => {
    onSearchChange(searchQuery + char);
  };

  const handleBackspace = () => {
    onSearchChange(searchQuery.slice(0, -1));
  };
  
  return (
    <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-slate-700">
      <div>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
                <SearchIcon className="h-5 w-5 text-slate-500" />
            </span>
            <input
                type="search"
                placeholder="Search entries (including translations)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search corpus entries"
                className="w-full p-2 pl-10 pr-12 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-300 flex flex-wrap items-center justify-center text-center md:text-left md:justify-start gap-x-4 gap-y-2">
            <div className="text-lg font-semibold">
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
            <div className="hidden md:block text-slate-600 font-light">|</div>
            <div className="text-lg font-semibold">
                Total Words: <span className="text-cyan-400">{totalWordCount.toLocaleString()}</span>
            </div>
        </div>
        <div className="flex items-center flex-wrap justify-center md:justify-end gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="category-select" className="text-sm font-medium text-slate-300">Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <label htmlFor="show-translations" className="flex items-center cursor-pointer select-none">
            <span className="mr-3 text-sm font-medium text-slate-300">Show Translations</span>
            <div className="relative">
                <input
                    type="checkbox"
                    id="show-translations"
                    className="sr-only peer"
                    checked={showTranslations}
                    onChange={(e) => onShowTranslationsChange(e.target.checked)}
                    aria-label="Show or hide translations"
                />
                <div className="block bg-slate-600 w-12 h-7 rounded-full peer-checked:bg-cyan-600 transition-colors"></div>
                <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
            </div>
          </label>
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportJson}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-sm font-medium rounded-md hover:bg-slate-500 transition-colors"
                aria-label={showTranslations ? "Export filtered entries with translations to JSON" : "Export filtered entries without translations to JSON"}
              >
                <DownloadIcon className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={onExportTxt}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-sm font-medium rounded-md hover:bg-slate-500 transition-colors"
                aria-label={showTranslations ? "Export filtered entries with translations to TXT" : "Export filtered entries without translations to TXT"}
              >
                <DownloadIcon className="h-4 w-4" />
                Export TXT
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">
              {showTranslations ? 'Exports include translations.' : 'Exports exclude translations.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorpusControls;
