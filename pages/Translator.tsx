
import React, { useState, useMemo } from 'react';
import { CorpusEntry } from '../types';
import { buildIndex, translateText, analyzeTextDeep, Index, AnalysisResult } from '../lib/translator';
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 00-1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const Translator: React.FC<TranslatorProps> = ({ entries, onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [translationMode, setTranslationMode] = useState<'auto' | 'toCT' | 'fromCT'>('auto');
  const [aiTranslation, setAiTranslation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Build index only once
  const index: Index = useMemo(() => buildIndex(entries), [entries]);

  const roughResult = useMemo(() => {
      return translateText(inputText, index, translationMode === 'auto' ? undefined : translationMode);
  }, [inputText, index, translationMode]);

  // Perform deep analysis on the input text
  const analysisResults: AnalysisResult[] = useMemo(() => {
      return analyzeTextDeep(inputText, entries);
  }, [inputText, entries]);

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

  const handleAiTranslate = async () => {
      if (!inputText.trim()) return;
      setIsAiLoading(true);
      setAiTranslation('');
      
      // Get unique corpus entries for context
      const contextEntriesMap = new Map<string, CorpusEntry>();
      analysisResults.forEach(res => {
          res.matches.forEach(match => {
              contextEntriesMap.set(match.id, match);
          });
      });
      // Limit context to top 50 most relevant matches to avoid huge prompts
      const contextEntries = Array.from(contextEntriesMap.values()).slice(0, 50);

      const translation = await getAITranslation(inputText, contextEntries, translationMode);
      setAiTranslation(translation);
      setIsAiLoading(false);
  };

  const modeLabel = {
      'auto': 'Auto-detect',
      'fromCT': 'Crimean Tatar → Other',
      'toCT': 'Other → Crimean Tatar'
  };

  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      {/* Main Translation Interface */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <button 
                    onClick={toggleMode}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                    title="Switch translation mode"
                >
                    <SwitchHorizontalIcon className="h-4 w-4" />
                    {modeLabel[translationMode]}
                </button>
                {translationMode === 'auto' && inputText && (
                    <span className="text-xs text-slate-500 hidden sm:inline">Detected: {roughResult.detectedLang}</span>
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
            <div className="flex flex-col relative">
                <label htmlFor="input-text" className="sr-only">Input Text</label>
                <textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type here to translate..."
                    className="flex-grow min-h-[200px] p-4 bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-y text-lg"
                />
                <button
                    onClick={handleAiTranslate}
                    disabled={isAiLoading || !inputText.trim()}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAiLoading ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SparklesIcon className="h-5 w-5" />
                    )}
                    Translate with AI
                </button>
                 {isKeyboardVisible && (
                    <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
                )}
            </div>

            <div className="flex flex-col gap-4">
                {/* AI Translation Result */}
                <div className={`flex-grow min-h-[120px] p-4 rounded-lg text-lg whitespace-pre-wrap overflow-auto border-2 transition-colors ${aiTranslation ? 'bg-cyan-50 border-cyan-200 text-slate-800' : 'bg-slate-100 border-slate-200 text-slate-400 italic'}`}>
                     <h3 className="text-sm font-semibold text-cyan-800 mb-2 uppercase tracking-wider flex items-center gap-1">
                        <SparklesIcon className="h-4 w-4" />
                        AI Translation
                     </h3>
                    {isAiLoading ? 'Translating...' : (aiTranslation || 'Click "Translate with AI" for a smart translation.')}
                </div>

                {/* Rough Dictionary Translation */}
                <div className="min-h-[80px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-700 whitespace-pre-wrap overflow-auto opacity-80">
                     <h3 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Dictionary Lookup (Word-for-word)</h3>
                    {roughResult.translation || '...'}
                </div>
            </div>
        </div>
      </div>

      {/* Detailed Word Analysis Section */}
      {inputText && (
          <div className="border-t border-slate-200 pt-6 animate-fade-in">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800 mb-4">
                  <SearchIcon className="h-5 w-5 text-cyan-600" />
                  Corpus Context
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                  The following corpus entries are used to help the AI understand the context and vocabulary of your text.
              </p>
              
              {analysisResults.length === 0 ? (
                  <p className="text-slate-500 italic">No direct matches found in the corpus for the analyzed words.</p>
              ) : (
                  <div className="space-y-6">
                      {analysisResults.map((res, index) => (
                          <div key={`${res.originalWord}-${index}`} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-500">Matches for:</span>
                                  <span className="text-lg font-bold text-cyan-700">"{res.originalWord}"</span>
                                  <span className="text-xs text-slate-400 ml-auto">{res.matches.length} matches shown</span>
                              </div>
                              <ul className="divide-y divide-slate-200">
                                  {res.matches.map(entry => (
                                      <EntryItem 
                                          key={entry.id} 
                                          entry={entry} 
                                          showTranslations={true} 
                                          showSources={true} 
                                      />
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Translator;
