import React from 'react';

interface HowToUseProps {
  onNavigate: (page: 'corpus') => void;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const HowToUse: React.FC<HowToUseProps> = ({ onNavigate }) => {
  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">How to Use This Corpus</h2>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>
      <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
        <p>This application allows you to explore and export a language corpus for Crimean Tatar (Romania). Here's how to use its features:</p>
        
        <h3 className="text-xl font-semibold text-slate-800">Searching and Filtering</h3>
        <ul>
          <li><strong>Search Bar:</strong> Type any word or phrase into the search bar at the top to filter entries. The search looks through the Crimean Tatar text, translations (if visible), and source names.</li>
          <li><strong>On-Screen Keyboard:</strong> Click the keyboard icon next to the search bar to show a virtual keyboard. This helps you type special characters unique to the Crimean Tatar alphabet (e.g., <code className="bg-slate-200 px-1 rounded">á, ç, ğ, í, î, ñ, ó, ş, ú</code>).</li>
          <li><strong>Category Filter:</strong> Use the "Category" dropdown to view entries from a specific source, like "Dictionary (Taner Murat)" or "Mikayil Emineskúw". Select "United Dictionary" to see all dictionary sources combined, or "All" to see everything.</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800">Viewing Entries</h3>
        <ul>
          <li><strong>Show Translations:</strong> Use the toggle switch to show or hide translations for entries that have them. This preference also affects the exported files.</li>
          <li><strong>Expand Long Entries:</strong> If an entry is too long to display fully, it will be truncated. Click on the entry to expand it and see the full text. Click it again to collapse it.</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800">Exporting Data</h3>
        <p>You can download the filtered entries for your own use. The content of the export depends on your current search query and category filter.</p>
        <ul>
            <li><strong className="font-semibold">Export JSON:</strong> Creates a <code className="bg-slate-200 px-1 rounded">.json</code> file, which is useful for developers and data analysis.</li>
            <li><strong className="font-semibold">Export TXT:</strong> Creates a plain <code className="bg-slate-200 px-1 rounded">.txt</code> file, which is easy to read and use in documents.</li>
        </ul>
        <p>Note: The "Show Translations" toggle determines whether the exported files will include the translation field.</p>
      </div>
    </div>
  );
};

export default HowToUse;