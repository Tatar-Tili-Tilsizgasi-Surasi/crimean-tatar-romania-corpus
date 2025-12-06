
import React from 'react';
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

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const KeyboardPage: React.FC<KeyboardPageProps> = ({ entries, onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
        alert("To install, tap 'Add to Home Screen' in your browser menu.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 absolute inset-0 z-50">
        {/* App Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-20">
            <button
                onClick={() => onNavigate('corpus')}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Exit"
            >
                <ArrowLeftIcon className="h-6 w-6" />
            </button>
            
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Tatar Keyboard</h1>
            
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700 text-sm font-semibold rounded-full hover:bg-cyan-100 transition-colors border border-cyan-100"
                title="Install App"
            >
                <DownloadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Install</span>
            </button>
        </div>

        {/* Keyboard Content */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
            <VirtualKeyboard entries={entries} />
        </div>
    </div>
  );
};

export default KeyboardPage;
