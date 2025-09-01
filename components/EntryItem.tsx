import React from 'react';
import { CorpusEntry } from '../types';

interface EntryItemProps {
  entry: CorpusEntry;
  showTranslations: boolean;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, showTranslations }) => {
  return (
    <li className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg hover:bg-slate-800/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <p className="flex-1 whitespace-pre-wrap text-slate-300 break-words">{entry.text}</p>
        <span className="flex-shrink-0 text-xs font-mono bg-slate-700 text-slate-400 px-2 py-1 rounded-md self-center">{entry.source}</span>
      </div>
      {showTranslations && entry.translation && (
        <p className="text-slate-400 italic mt-2 pt-2 border-t border-slate-800">
          {entry.translation}
        </p>
      )}
    </li>
  );
};

export default EntryItem;