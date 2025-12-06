
import React, { useState } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { CorpusEntry } from '../types';

interface KeyboardPageProps {
  entries: CorpusEntry[];
  onNavigate: (page: 'corpus') => void;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const KeyboardPage: React.FC<KeyboardPageProps> = ({ entries, onNavigate }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50">
        {/* App Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 shadow-sm z-20 shrink-0 h-14">
            <button
                onClick={() => onNavigate('corpus')}
                className="p-2 -ml-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Exit"
            >
                <ArrowLeftIcon className="h-6 w-6" />
            </button>
            
            <div className="flex-grow flex justify-center items-center gap-2" onClick={() => setShowInfo(true)}>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight cursor-pointer text-center">Online Virtual Keyboard</h1>
                <InfoIcon className="h-5 w-5 text-slate-400" />
            </div>
            
            {/* Empty div to balance header layout since Install button is removed */}
            <div className="w-10"></div>
        </div>

        {/* Info Modal */}
        {showInfo && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">How to use</h3>
                    <p className="text-slate-600 text-sm mb-4">
                        This is an online virtual keyboard for Crimean Tatar (Romania).
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 mb-4">
                        <li>Type your message here using the Tatar keys.</li>
                        <li>Long-press keys to reveal special Crimean Tatar characters (e.g., hold <strong>s</strong> for <strong>ş</strong>).</li>
                        <li>Tap <strong>Share</strong> to send directly to Communication Apps.</li>
                        <li>Or tap <strong>Copy</strong> and paste it manually.</li>
                    </ol>
                    <button 
                        onClick={() => setShowInfo(false)}
                        className="w-full py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700"
                    >
                        Got it
                    </button>
                </div>
            </div>
        )}

        {/* Keyboard Content */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
            <VirtualKeyboard entries={entries} />
        </div>
    </div>
  );
};

export default KeyboardPage;
