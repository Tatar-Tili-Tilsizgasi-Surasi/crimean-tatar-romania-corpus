import React, { useState } from 'react';
import { CorpusEntry } from '../types';

interface EntryItemProps {
  entry: CorpusEntry;
  showTranslations: boolean;
  showSources: boolean;
}

// Thresholds for truncating long entries
const MAX_LINES = 1000;
const MAX_CHARS = 65536;

const needsTruncation = (text: string) => {
  return text.length > MAX_CHARS || text.split('\n').length > MAX_LINES;
};

const truncateText = (text: string) => {
  const lines = text.split('\n');
  // Truncate by lines first if it has many lines
  if (lines.length > MAX_LINES) {
    return lines.slice(0, MAX_LINES).join('\n') + '\n...';
  }
  // Otherwise, truncate by character count if it's a very long single block
  if (text.length > MAX_CHARS) {
    return text.slice(0, MAX_CHARS) + '...';
  }
  return text;
};

const EntryItem: React.FC<EntryItemProps> = ({ entry, showTranslations, showSources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isTextLong = needsTruncation(entry.text);
  const isTranslationLong = showTranslations && entry.translation && needsTruncation(entry.translation);

  const isExpandable = isTextLong || isTranslationLong;

  const toggleExpansion = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayedText = isTextLong && !isExpanded
    ? truncateText(entry.text)
    : entry.text;

  const displayedTranslation = isTranslationLong && !isExpanded && entry.translation
    ? truncateText(entry.translation)
    : entry.translation;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpansion(e);
    }
  };

  return (
    <li 
      className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus-within:ring-2 focus-within:ring-cyan-500 focus:outline-none"
      onClick={isExpandable ? toggleExpansion : undefined}
      style={{ cursor: isExpandable ? 'pointer' : 'default' }}
      aria-expanded={isExpandable ? isExpanded : undefined}
      tabIndex={isExpandable ? 0 : -1}
      onKeyDown={isExpandable ? handleKeyDown : undefined}
      role={isExpandable ? "button" : undefined}
      aria-label={isExpandable ? (isExpanded ? `Collapse entry from ${entry.source}` : `Expand entry from ${entry.source}`) : undefined}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
        <p className="flex-1 w-full whitespace-pre-wrap text-slate-800 break-words">{displayedText}</p>
        {showSources && (
          <span className="flex-shrink-0 text-xs font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded-md self-end sm:self-center">{entry.source}</span>
        )}
      </div>
      {showTranslations && entry.translation && (
        <p className="text-slate-500 italic mt-2 pt-2 border-t border-slate-200 whitespace-pre-wrap break-words">
          {displayedTranslation}
        </p>
      )}
      {isExpandable && (
        <div className="text-right mt-2 text-sm text-cyan-500 font-semibold">
          {isExpanded ? 'Show less' : 'Show more'}
        </div>
      )}
    </li>
  );
};

export default EntryItem;