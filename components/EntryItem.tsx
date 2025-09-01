import React from 'react';
import { CorpusEntry } from '../types';

interface EntryItemProps {
  entry: CorpusEntry;
  showTranslations: boolean;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, showTranslations }) => {
  return (
    <li className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <p className="flex-1 whitespace-pre-wrap text-slate-800 break-words">{entry.text}</p>
        <span className="flex-shrink-0 text-xs font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded-md self-center">{entry.source}</span>
      </div>
      {showTranslations && entry.translation && (
        <p className="text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
          {entry.translation}
        </p>
      )}
    </li>
  );
};

export default EntryItem;