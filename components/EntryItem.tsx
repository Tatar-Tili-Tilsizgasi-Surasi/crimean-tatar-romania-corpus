import React, { useState, useCallback } from 'react';
import { CorpusEntry } from '../types';

interface EntryItemProps {
  entry: CorpusEntry;
  showTranslations: boolean;
  showSources: boolean;
}

// Thresholds for truncating long entries.
// Reduced to ensure moderately long entries are collapsed by default for better list view.
const MAX_LINES = 6;
const MAX_CHARS = 400;

const needsTruncation = (text: string) => {
  if (text.length > MAX_CHARS) return true;
  return text.split('\n').length > MAX_LINES;
};

const truncateText = (text: string) => {
  if (text.length > MAX_CHARS) {
      // Try to cut nicely at a space
      let cut = text.slice(0, MAX_CHARS);
      const lastSpace = cut.lastIndexOf(' ');
      if (lastSpace > MAX_CHARS * 0.8) { // Only if space is reasonably close to the end
          cut = cut.slice(0, lastSpace);
      }
      return cut.trim() + '...';
  }

  const lines = text.split('\n');
  if (lines.length > MAX_LINES) {
    return lines.slice(0, MAX_LINES).join('\n').trim() + '\n...';
  }
  
  return text;
};

const EntryItem: React.FC<EntryItemProps> = ({ entry, showTranslations, showSources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isTextLong = needsTruncation(entry.text);
  const isTranslationLong = showTranslations && entry.translation && needsTruncation(entry.translation);

  const isExpandable = isTextLong || isTranslationLong;

  const toggleExpansion = useCallback(() => {
      if (isExpandable) {
          setIsExpanded(prev => !prev);
      }
  }, [isExpandable]);

  // Handle clicks on the list item, but avoid toggling if user is selecting text
  const handleItemClick = (e: React.MouseEvent) => {
      if (!isExpandable) return;
      
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
          return; // Don't toggle if text is selected
      }
      
      toggleExpansion();
  };

  const displayedText = isTextLong && !isExpanded
    ? truncateText(entry.text)
    : entry.text;

  const displayedTranslation = isTranslationLong && !isExpanded && entry.translation
    ? truncateText(entry.translation)
    : entry.translation;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isExpandable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleExpansion();
    }
  };

  return (
    <li 
      className={`p-4 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-cyan-500 focus:outline-none ${isExpandable ? 'hover:bg-slate-100 cursor-pointer' : ''}`}
      onClick={handleItemClick}
      tabIndex={isExpandable ? 0 : -1}
      onKeyDown={handleKeyDown}
      role={isExpandable ? "button" : undefined}
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-label={isExpandable ? (isExpanded ? `Collapse entry from ${entry.source}` : `Expand entry from ${entry.source}`) : undefined}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
        <p className="flex-1 w-full whitespace-pre-wrap text-slate-800 break-words overflow-hidden">{displayedText}</p>
        {showSources && (
          <span className="flex-shrink-0 text-xs font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded-md self-end sm:self-center">{entry.source}</span>
        )}
      </div>
      {showTranslations && entry.translation && (
        <p className="text-slate-500 italic mt-2 pt-2 border-t border-slate-200 whitespace-pre-wrap break-words overflow-hidden">
          {displayedTranslation}
        </p>
      )}
      {isExpandable && (
        <div className="text-right mt-2 text-sm text-cyan-600 font-semibold">
          {isExpanded ? 'Show less' : 'Show more'}
        </div>
      )}
    </li>
  );
};

export default EntryItem;