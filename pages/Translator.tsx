
import React, { useState, useMemo } from 'react';
import { CorpusEntry } from '../types';
import { analyzeTextDeep, AnalysisResult } from '../lib/translator';
import { getAITranslation } from '../lib/ai';
import Keyboard from '../components/Keyboard';
import EntryItem from '../components/EntryItem';

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

const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

type Language = 'Crimean Tatar (Romania)' | 'Crimean Tatar (Standard)' | 'English' | 'Romanian';

const Translator: React.FC<TranslatorProps> = ({ entries, onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [sourceLang, setSourceLang] = useState<Language>('English');
  const [targetLang, setTargetLang] = useState<Language>('Crimean Tatar (Romania)');
  
  const [aiTranslation, setAiTranslation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Perform deep analysis on the input text to provide context to AI and user
  const analysisResults: AnalysisResult[] = useMemo(() => {
      return analyzeTextDeep(inputText, entries);
  }, [inputText, entries]);

  const handleKeyPress = (char: string) => {
    setInputText(prev => prev + char);
  };

  const handleBackspace = () => {
    setInputText(prev => prev.slice(0, -1));
  };

  const handleSwapLanguages = () => {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
  };

  const handleTranslate = async () => {
      if (!inputText.trim()) return;
      setIsAiLoading(true);
      setAiTranslation('');

      // Extract unique relevant entries to pass as context to the AI
      const allMatches = analysisResults.flatMap(res => res.matches);
      const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.id, item])).values());

      const result = await getAITranslation(inputText, sourceLang, targetLang, uniqueMatches);
      setAiTranslation(result);
      setIsAiLoading(false);
  };

  const supportedLanguages: Language[] = [
      'Crimean Tatar (Romania)',
      'Crimean Tatar (Standard)',
      'English',
      'Romanian'
  ];

  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-4 sm:p-6 md:p-8 animate-fade-in gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-cyan-500" />
                AI Translator
            </h2>
            <p className="text-sm text-slate-500 mt-1">Powered by Gemini. Specialized for the Romania dialect.</p>
        </div>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>

      {/* Language Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-3xl">
              <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as Language)}
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Source language"
              >
                  {supportedLanguages.map(lang => (
                      <option key={lang} value={lang} disabled={lang === targetLang}>{lang}</option>
                  ))}
              </select>
              
              <button 
                  onClick={handleSwapLanguages}
                  className="p-2 rounded-full bg-slate-200 hover:bg-cyan-100 text-slate-600 hover:text-cyan-700 transition-colors flex-shrink-0"
                  title="Swap languages"
                  aria-label="Swap source and target languages"
              >
                  <SwitchHorizontalIcon className="h-5 w-5" />
              </button>

              <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as Language)}
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Target language"
              >
                   {supportedLanguages.map(lang => (
                      <option key={lang} value={lang} disabled={lang === sourceLang}>{lang}</option>
                  ))}
              </select>
          </div>

          <button
            onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 w-full md:w-auto justify-center ${isKeyboardVisible ? 'bg-cyan-100 text-cyan-700' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
            <KeyboardIcon className="h-5 w-5" />
            Keyboard
        </button>
      </div>

      {/* Input/Output Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Input Side */}
          <div className="flex flex-col relative gap-4">
              <div className="relative flex-grow">
                  <label htmlFor="input-text" className="sr-only">Input Text</label>
                  <textarea
                      id="input-text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Enter ${sourceLang} text here...`}
                      className="w-full h-full min-h-[200px] p-4 bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-y text-lg"
                  />
              </div>
               {isKeyboardVisible && (
                  <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
              )}
               <button
                   onClick={handleTranslate}
                   disabled={!inputText.trim() || isAiLoading}
                   className="md:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
               >
                   {isAiLoading ? 'Translating...' : 'Translate'}
               </button>
          </div>

          {/* Output Side */}
          <div className="flex flex-col relative">
               <div className={`flex-grow min-h-[200px] p-4 rounded-lg border-2 transition-colors relative ${aiTranslation ? 'bg-white border-cyan-500' : 'bg-slate-50 border-slate-200'}`}>
                   {isAiLoading ? (
                       <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                           <svg className="animate-spin h-8 w-8 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <p className="font-medium text-cyan-700 animate-pulse">Translating...</p>
                       </div>
                   ) : aiTranslation ? (
                       <div className="text-lg text-slate-800 whitespace-pre-wrap">{aiTranslation}</div>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-60">
                          <p className="text-slate-400 italic">
                              Translation will appear here.
                          </p>
                       </div>
                   )}
              </div>
              
               {/* Desktop Translate Button (centered overlay) */}
               <div className="hidden md:flex absolute top-1/2 -left-3 -translate-x-1/2 -translate-y-1/2 z-10">
                   <button
                       onClick={handleTranslate}
                       disabled={!inputText.trim() || isAiLoading}
                       className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border-4 border-white"
                       title="Translate"
                   >
                       {isAiLoading ? (
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                       ) : (
                           <ArrowLeftIcon className="h-6 w-6 rotate-180" />
                       )}
                   </button>
               </div>
          </div>
      </div>

      {/* Detailed Word Analysis Section */}
      {inputText && (
          <div className="border-t border-slate-200 pt-8 animate-fade-in">
              <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-2">
                      <SearchIcon className="h-5 w-5 text-cyan-600" />
                      Corpus Context
                  </h3>
                  <p className="text-sm text-slate-600">
                      The AI uses these entries from the corpus to ensure accurate, dialect-specific terminology.
                  </p>
              </div>
              
              {analysisResults.length === 0 ? (
                  <div className="text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-200 text-center text-sm">
                      No direct matches found in the corpus for individual words. The AI will rely on its general linguistic knowledge of the dialect.
                  </div>
              ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {analysisResults.slice(0, 6).map((res, index) => (
                          <div key={`${res.originalWord}-${index}`} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col max-h-[250px]">
                              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Matches for:</span>
                                  <span className="text-base font-bold text-cyan-700">"{res.originalWord}"</span>
                                  <span className="text-xs text-slate-400 ml-auto bg-slate-200 px-2 py-0.5 rounded-full">{res.matches.length}</span>
                              </div>
                              <ul className="divide-y divide-slate-200 overflow-y-auto flex-grow p-0">
                                  {res.matches.slice(0, 5).map(entry => (
                                      <div key={entry.id} className="scale-90 origin-top-left -mb-4 last:mb-0">
                                        <EntryItem 
                                            entry={entry} 
                                            showTranslations={true} 
                                            showSources={true} 
                                        />
                                      </div>
                                  ))}
                              </ul>
                          </div>
                      ))}
                      {analysisResults.length > 6 && (
                          <div className="text-center text-sm text-slate-500 col-span-full pt-2">
                              and {analysisResults.length - 6} more terms analyzed...
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Translator;
