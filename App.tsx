
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import CorpusControls from './components/CorpusControls';
import CorpusList from './components/CorpusList';
import HowToUse from './pages/HowToUse';
import About from './pages/About';
import Sources from './pages/Sources';
import Translator from './pages/Translator';
import KeyboardPage from './pages/KeyboardPage';
import { corpus as initialCorpus } from './components/corpus-data';
import { CorpusEntry } from './types';

type Page = 'corpus' | 'howto' | 'about' | 'sources' | 'translator' | 'keyboard';

const App: React.FC = () => {
  // Initialize state based on URL params to support PWA start_url logic
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('page') === 'keyboard') {
            return 'keyboard';
        }
    }
    return 'corpus';
  });

  const entries: CorpusEntry[] = initialCorpus;
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync URL with state (optional, but good for back button behavior if we added history push)
  useEffect(() => {
      if (currentPage === 'keyboard') {
          // If we navigate to keyboard, we might want to ensure URL reflects it for bookmarking, 
          // but mainly we just want to ensure the state is consistent.
      }
  }, [currentPage]);

  const categories = useMemo(() => {
    const allSources = entries.map(entry => entry.source);
    const uniqueSources = [...new Set(allSources)].sort((a, b) => a.localeCompare(b));
    return ['All', 'All (Dictionaries)', ...uniqueSources];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Category filter
      if (selectedCategory === 'All (Dictionaries)') {
        if (!entry.source.includes('Dictionary')) {
            return false;
        }
      } else if (selectedCategory !== 'All' && entry.source !== selectedCategory) {
        return false;
      }
      
      // Search query filter
      if (!searchQuery) {
        return true;
      }

      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        entry.text.toLowerCase().includes(lowerCaseQuery) ||
        entry.source.toLowerCase().includes(lowerCaseQuery) ||
        (showTranslations && entry.translation && entry.translation.toLowerCase().includes(lowerCaseQuery))
      );
    });
  }, [entries, searchQuery, showTranslations, selectedCategory]);

  const totalWordCount = useMemo(() => {
    return entries.reduce((count, entry) => {
      if (!entry.text.trim()) {
        return count;
      }
      return count + entry.text.trim().split(/\s+/).length;
    }, 0);
  }, [entries]);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = useCallback(() => {
    if (filteredEntries.length === 0) {
      alert("No entries to export. Try adjusting your search.");
      return;
    }
    const entriesToExport = filteredEntries.map(e => {
        const entry: Partial<CorpusEntry> = { text: e.text };
        if (showTranslations && e.translation) entry.translation = e.translation;
        if (showSources) entry.source = e.source;
        return entry;
    });

    const jsonContent = JSON.stringify(entriesToExport, null, 2);
    downloadFile(jsonContent, 'crimean_tatar_corpus.json', 'application/json');
  }, [filteredEntries, showTranslations, showSources]);

  const handleExportTxt = useCallback(() => {
    if (filteredEntries.length === 0) {
      alert("No entries to export. Try adjusting your search.");
      return;
    }
    const txtContent = filteredEntries.map(e => {
        let entryText = '';
        if (showSources) {
            entryText += `Source: ${e.source}\n`;
        }
        entryText += e.text;
        if (showTranslations && e.translation) {
            entryText += `\nTranslation: ${e.translation}`;
        }
        return entryText;
    }).join('\n\n---\n\n');
    downloadFile(txtContent, 'crimean_tatar_corpus.txt', 'text/plain');
  }, [filteredEntries, showTranslations, showSources]);
  
  const renderContent = () => {
    switch (currentPage) {
        case 'howto':
            return <HowToUse onNavigate={setCurrentPage} />;
        case 'about':
            return <About onNavigate={setCurrentPage} />;
        case 'sources':
            return <Sources onNavigate={setCurrentPage} />;
        case 'translator':
            return <Translator entries={entries} onNavigate={setCurrentPage} />;
        case 'keyboard':
            return <KeyboardPage entries={entries} onNavigate={setCurrentPage} />;
        case 'corpus':
        default:
            return (
                <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-4 md:p-6 animate-fade-in">
                    <CorpusControls
                        entryCount={filteredEntries.length}
                        totalCount={entries.length}
                        totalWordCount={totalWordCount}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onExportJson={handleExportJson}
                        onExportTxt={handleExportTxt}
                        showTranslations={showTranslations}
                        onShowTranslationsChange={setShowTranslations}
                        showSources={showSources}
                        onShowSourcesChange={setShowSources}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                    <CorpusList 
                        entries={filteredEntries} 
                        searchQuery={searchQuery} 
                        showTranslations={showTranslations} 
                        showSources={showSources}
                    />
                </div>
            );
    }
  };

  // For the keyboard page, we want a full-screen standalone look, so we might hide the header/footer
  if (currentPage === 'keyboard') {
      return renderContent();
  }

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 flex flex-col h-full">
      <Header onNavigate={setCurrentPage} />
      <main className="flex-grow flex flex-col gap-4 sm:gap-8 mt-4 sm:mt-8">
        {renderContent()}
      </main>
      <footer className="text-center mt-8 text-slate-500 text-sm">
        <p>
          You can find the source of this website in <a href="https://github.com/Tatar-Tili-Tilsizgasi-Surasi/crimean-tatar-romania-corpus" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">GitHub</a>.
        </p>
      </footer>
    </div>
  );
};

export default App;
