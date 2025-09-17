import React from 'react';

interface SourcesProps {
  onNavigate: (page: 'corpus') => void;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const sources = {
  dictionaries: [
    { name: 'Dictionary (Taner Murat)', originalLanguage: 'Romanian' },
    { name: 'Botanical Dictionary (Taner Murat)', originalLanguage: 'Latin' },
    { name: 'Ornithological Dictionary (Taner Murat)', originalLanguage: 'Latin' },
    { name: 'Dictionary (Missing terms added by the community)', originalLanguage: 'Romanian' },
  ],
  prose: [
    'Taner Murat - Fiat Justitia',
    'Taner Murat - Ótken bír şaklayga sewdam',
    'Taner Murat - Perúzelí salînğak',
    'Taner Murat - Website',
    'Taner Murat - The Sounds of Tatar Spoken in Romania',
  ],
  poetry: [
    { author: 'Mikayil Emineskúw', originalLanguage: 'Romanian' },
    { author: 'Friedrich Schiller', originalLanguage: 'German' },
    { author: 'Charles Baudelaire', originalLanguage: 'French' },
    { author: 'Paul Verlaine', originalLanguage: 'French' },
    { author: 'Arthur Rimbaud', originalLanguage: 'French' },
    { author: 'Adem Miskiyebiç', originalLanguage: 'English' },
    { author: 'Úte Karsun', originalLanguage: 'English' },
    { author: 'Geriy Bek', originalLanguage: 'English' },
    { author: 'Ram Krishna Singh', originalLanguage: 'English', works: ['Ram Krishna Singh - Kovid-19 hem sessízlík tolkînî', 'Ram Krishna Singh - Men Isa tuwulman'] },
    { author: 'Abdullah Tukay', originalLanguage: 'Kazan Tatar' },
    { author: 'Abdulhalik Uygur', originalLanguage: 'Uyghur' },
  ]
};

const Sources: React.FC<SourcesProps> = ({ onNavigate }) => {
  return (
    <div className="flex-grow flex flex-col bg-white rounded-lg shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Sources and Translators</h2>
        <button
          onClick={() => onNavigate('corpus')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors self-start sm:self-auto"
          aria-label="Back to corpus"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Corpus
        </button>
      </div>
      <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
        
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Poetry</h3>
          <p>All poems in this corpus were translated into Crimean Tatar (Romania) by <strong className="font-semibold">Taner Murat</strong>.</p>
          <ul className="list-disc pl-5 space-y-2">
            {sources.poetry.map(poem => (
              <li key={poem.author}>
                <strong className="font-semibold">{poem.author}</strong> - Original language: {poem.originalLanguage}.
                {poem.works && (
                    <ul className="list-['-_'] pl-5 mt-1 text-sm">
                        {poem.works.map(work => <li key={work}>Corpus source name: <em>{work}</em></li>)}
                    </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-slate-800">Dictionaries</h3>
            <ul className="list-disc pl-5 space-y-2">
                {sources.dictionaries.map(dict => (
                  <li key={dict.name}>
                    <strong className="font-semibold">{dict.name}</strong> - Original language: {dict.originalLanguage}.
                  </li>
                ))}
            </ul>
        </div>
        
        <div>
            <h3 className="text-xl font-semibold text-slate-800">Prose</h3>
            <ul className="list-disc pl-5 space-y-1">
                {sources.prose.map(p => (
                <li key={p}>{p}</li>
                ))}
            </ul>
        </div>

      </div>
    </div>
  );
};

export default Sources;