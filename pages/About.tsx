
import React from 'react';

interface AboutProps {
  onNavigate: (page: 'corpus') => void;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in min-h-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">About Crimean Tatar (Romania)</h2>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>
      <div className="prose prose-slate max-w-none text-slate-700 space-y-4 overflow-y-auto flex-grow pr-2">
        <p>The Crimean Tatar language as spoken in Romania is a unique dialect with a rich history. This project aims to collect, preserve, and provide access to a corpus of this language variant.</p>

        <h3 className="text-xl font-semibold text-slate-800">Linguistic Features</h3>
        <p>The dialect is primarily based on the one spoken in the northern steppe of the Crimean peninsula, also known as the Nogay dialect. Over time, it has been significantly influenced by Turkish (Ottoman Turkish). Additionally, due to its long history in the region, it has incorporated numerous loanwords from Romanian.</p>
        <p>This blend of influences makes the Romanian dialect of Crimean Tatar a fascinating subject for linguistic study and a vital part of the cultural heritage of the Tatar community in Romania.</p>
        
        <h3 className="text-xl font-semibold text-slate-800">Project Goals</h3>
        <p>The primary goals of this language corpus are:</p>
        <ul>
          <li><strong>Preservation:</strong> To create a digital archive of the language to prevent its loss and ensure it is available for future generations.</li>
          <li><strong>Education:</strong> To provide a resource for learners, educators, and researchers interested in Crimean Tatar.</li>
          <li><strong>Accessibility:</strong> To make the language data easily searchable, viewable, and exportable for various purposes.</li>
          <li><strong>Community:</strong> To foster a community around the language and encourage its use and study.</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800">Contribution</h3>
        <p>This is a community-driven project. If you are interested in contributing, please visit the project's <a href="https://github.com/Tatar-Tili-Tilsizgasi-Surasi/crimean-tatar-romania-corpus" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">GitHub repository</a> for more information.</p>
      </div>
    </div>
  );
};

export default About;
