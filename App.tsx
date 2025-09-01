import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import CorpusControls from './components/CorpusControls';
import CorpusList from './components/CorpusList';
import { corpus as initialCorpus } from './components/corpus-data';
import { CorpusEntry } from './types';

const App: React.FC = () => {
  const entries: CorpusEntry[] = initialCorpus;
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const allSources = entries.map(entry => entry.source);
    return ['All', ...Array.from(new Set(allSources))];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Category filter
      if (selectedCategory !== 'All' && entry.source !== selectedCategory) {
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

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col gap-8 mt-8">
        <div className="flex-grow flex flex-col bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 p-4 md:p-6">
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
      </main>
    </div>
  );
};

export default App;
