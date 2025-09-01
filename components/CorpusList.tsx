import React from 'react';
import { CorpusEntry } from '../types';
import EntryItem from './EntryItem';

interface CorpusListProps {
  entries: CorpusEntry[];
  searchQuery: string;
  showTranslations: boolean;
}

const CorpusList: React.FC<CorpusListProps> = ({ entries, searchQuery, showTranslations }) => {
  if (entries.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-center text-slate-400 p-8">
        {searchQuery ? (
          <div>
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p>Your search for "{searchQuery}" did not match any entries.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold">The corpus is empty.</h3>
            <p>Add new entries to the files inside the `data` directory to see them here.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} showTranslations={showTranslations} />
        ))}
      </ul>
    </div>
  );
};

export default CorpusList;