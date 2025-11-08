
import React, { useState, useMemo } from 'react';
import { CorpusEntry } from '../types';
import { buildIndex, translateText, Index } from '../lib/translator';
import Keyboard from '../components/Keyboard';

interface TranslatorProps {
  entries: CorpusEntry[];
  onNavigate: (page: 'corpus') => void;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const SwitchHorizontalIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const KeyboardIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const Translator: React.FC<TranslatorProps> = ({ entries, onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [translationMode, setTranslationMode] = useState<'auto' | 'toCT' | 'fromCT'>('auto');
  
  // Build index only once
  const index: Index = useMemo(() => buildIndex(entries), [entries]);

  const result = useMemo(() => {
      return translateText(inputText, index, translationMode === 'auto' ? undefined : translationMode);
  }, [inputText, index, translationMode]);

  const handleKeyPress = (char: string) => {
    setInputText(prev => prev + char);
  };

  const handleBackspace = () => {
    setInputText(prev => prev.slice(0, -1));
  };

  const toggleMode = () => {
      if (translationMode === 'auto') setTranslationMode('fromCT');
      else if (translationMode === 'fromCT') setTranslationMode('toCT');
      else setTranslationMode('auto');
  };

  const modeLabel = {
      'auto': 'Auto-detect',
      'fromCT': 'Crimean Tatar → Other',
      'toCT': 'Other → Crimean Tatar'
  };

  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Translator <span className="text-sm font-normal text-slate-500">(Beta)</span></h2>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleMode}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                    title="Switch translation mode"
                >
                    <SwitchHorizontalIcon className="h-4 w-4" />
                    {modeLabel[translationMode]}
                </button>
                {translationMode === 'auto' && inputText && (
                    <span className="text-xs text-slate-500 hidden sm:inline">Detected: {result.detectedLang}</span>
                )}
            </div>
            <button
                onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isKeyboardVisible ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                <KeyboardIcon className="h-4 w-4" />
                Keyboard
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col">
                <label htmlFor="input-text" className="sr-only">Input Text</label>
                <textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type here to translate..."
                    className="flex-grow min-h-[200px] p-4 bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-y text-lg"
                />
                 {isKeyboardVisible && (
                    <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
                )}
            </div>

            <div className="flex flex-col">
                <div className="flex-grow min-h-[200px] p-4 bg-cyan-50 border border-cyan-100 rounded-lg text-lg text-slate-800 whitespace-pre-wrap overflow-auto">
                    {result.translation || <span className="text-slate-400 italic">Translation will appear here...</span>}
                </div>
            </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-100">
            <p><strong>Note:</strong> This is a basic dictionary-based translator. It uses the corpus data to find matches and can perform simple analysis of common Crimean Tatar suffixes (like plurals and cases) to aid translation. It is not a full grammatical machine translation engine.</p>
        </div>
      </div>
    </div>
  );
};

export default Translator;
