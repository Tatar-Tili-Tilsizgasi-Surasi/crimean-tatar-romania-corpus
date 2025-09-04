import React, { useState } from 'react';
import * as GoogleGenerativeAI from '@google/genai';
import { corpus } from '../components/corpus-data';
import { CorpusEntry } from '../types';
import {
  CRIMEAN_TATAR_RO_ALPHABET_PRONUNCIATION_GUIDE,
  CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
  CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
  CRIMEAN_TATAR_RO_EXAMPLES,
  CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
  CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO,
  CRIMEAN_TATAR_RO_SYLLABLE_STRUCTURE_INFO,
  CRIMEAN_TATAR_RO_BIRD_NAMES_TABLE,
  CRIMEAN_TATAR_RO_COMPREHENSIVE_GRAMMAR_DETAILS,
} from '../data/promptData';

// --- ICONS ---
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
const ClipboardCopyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


interface TranslatorProps {
  onNavigate: (page: 'corpus') => void;
}

const LANGUAGES = {
  'cr-RO': 'Crimean Tatar (Romania)',
  'ro': 'Romanian',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
};
type LanguageKey = keyof typeof LANGUAGES;

const formatCorpusForPrompt = (corpusData: CorpusEntry[]): string => {
  return corpusData
    .map(entry => {
      let text = `# ${entry.text}`;
      if (entry.translation) {
        text += ` — ${entry.translation}`;
      }
      return text;
    })
    .join('\n');
};

const corpusExamples = formatCorpusForPrompt(corpus);

const SYSTEM_INSTRUCTION = `
You are an expert translator specializing in the Crimean Tatar (Romania) dialect. Your primary goal is to provide accurate, natural, and contextually appropriate translations.

When translating to or from "Crimean Tatar (Romania)", you MUST adhere strictly to the following linguistic rules, orthography, and examples. This is not standard Crimean Tatar; it is the specific Dobrujan dialect. Do not confuse it with other Turkic languages or dialects.

You must only output the translated text. Do not add any commentary, explanations, or labels like "Translation:".

--- LINGUISTIC CONTEXT & RULES FOR CRIMEAN TATAR (ROMANIA) ---

${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_ALPHABET_PRONUNCIATION_GUIDE}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}
${CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO}
${CRIMEAN_TATAR_RO_SYLLABLE_STRUCTURE_INFO}
${CRIMEAN_TATAR_RO_COMPREHENSIVE_GRAMMAR_DETAILS}
${CRIMEAN_TATAR_RO_BIRD_NAMES_TABLE}
${CRIMEAN_TATAR_RO_EXAMPLES}

--- START OF FULL CORPUS EXAMPLES ---
${corpusExamples}
--- END OF FULL CORPUS EXAMPLES ---

--- END OF LINGUISTIC CONTEXT & RULES ---
`;

const Translator: React.FC<TranslatorProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<LanguageKey>('en');
  const [targetLang, setTargetLang] = useState<LanguageKey>('cr-RO');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    if (sourceLang === targetLang) {
        setError("Source and target languages cannot be the same.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const ai = new GoogleGenerativeAI.GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `Translate the following text from ${LANGUAGES[sourceLang]} to ${LANGUAGES[targetLang]}:\n\n"${inputText}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      setOutputText(response.text.trim());

    } catch (e: any) {
      console.error(e);
      setError("An error occurred during translation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const languageOptions = Object.entries(LANGUAGES).map(([key, name]) => ({ key, name }));

  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Translator</h2>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>
      
      <div className="flex flex-col gap-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="flex-1 flex justify-center md:justify-start">
                 <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value as LanguageKey)}
                    className="bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors w-full sm:w-auto"
                    aria-label="Select source language"
                >
                    {languageOptions.map(lang => <option key={lang.key} value={lang.key}>{lang.name}</option>)}
                </select>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <button 
                    onClick={handleSwapLanguages}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    aria-label="Swap source and target languages"
                >
                    <SwitchHorizontalIcon className="h-6 w-6" />
                </button>
            </div>
             <div className="flex-1 flex justify-center md:justify-end">
                 <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value as LanguageKey)}
                    className="bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors w-full sm:w-auto"
                    aria-label="Select target language"
                >
                    {languageOptions.map(lang => <option key={lang.key} value={lang.key}>{lang.name}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter text in ${LANGUAGES[sourceLang]}...`}
            className="w-full h-48 md:h-full p-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
            aria-label="Input text for translation"
          />
          <div className="relative w-full h-48 md:h-full">
            <textarea
              value={isLoading ? 'Translating...' : outputText}
              readOnly
              placeholder="Translation will appear here..."
              className="w-full h-full p-3 bg-slate-50 border-2 border-slate-200 rounded-lg resize-none focus:outline-none"
              aria-label="Translated text output"
            />
            {outputText && !isLoading && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                aria-label="Copy translated text"
              >
                {copied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <ClipboardCopyIcon className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full sm:w-auto self-center px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>
      </div>
    </div>
  );
};

export default Translator;