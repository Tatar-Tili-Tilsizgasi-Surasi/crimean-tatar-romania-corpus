import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import CorpusControls from './components/CorpusControls';
import CorpusList from './components/CorpusList';
import HowToUse from './pages/HowToUse';
import About from './pages/About';
import Sources from './pages/Sources';
import { corpus as initialCorpus } from './components/corpus-data';
import { CorpusEntry } from './types';

type Page = 'corpus' | 'howto' | 'about' | 'sources';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('corpus');
  const entries: CorpusEntry[] = initialCorpus;
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    const entriesToExport = showTranslations
      ? filteredEntries.map(e => ({ text: e.text, translation: e.translation, source: e.source }))
      : filteredEntries.map(e => ({ text: e.text, source: e.source }));

    const jsonContent = JSON.stringify(entriesToExport, null, 2);
    downloadFile(jsonContent, 'crimean_tatar_corpus.json', 'application/json');
  }, [filteredEntries, showTranslations]);

  const handleExportTxt = useCallback(() => {
    if (filteredEntries.length === 0) {
      alert("No entries to export. Try adjusting your search.");
      return;
    }
    const txtContent = filteredEntries.map(e => {
        let entryText = `Source: ${e.source}\n${e.text}`;
        if (showTranslations && e.translation) {
            entryText += `\nTranslation: ${e.translation}`;
        }
        return entryText;
    }).join('\n\n---\n\n');
    downloadFile(txtContent, 'crimean_tatar_corpus.txt', 'text/plain');
  }, [filteredEntries, showTranslations]);
  
  const renderContent = () => {
    switch (currentPage) {
        case 'howto':
            return <HowToUse onNavigate={setCurrentPage} />;
        case 'about':
            return <About onNavigate={setCurrentPage} />;
        case 'sources':
            return <Sources onNavigate={setCurrentPage} />;
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
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                    <CorpusList entries={filteredEntries} searchQuery={searchQuery} showTranslations={showTranslations} />
                </div>
            );
    }
  };

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 flex flex-col">
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