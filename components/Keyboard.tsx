import React from 'react';

const BackspaceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM15 12H9m3-3l-3 3 3 3" />
    </svg>
);

const Keyboard: React.FC<{
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
}> = ({ onKeyPress, onBackspace }) => {
    const keyRows = [
        ['a', 'á', 'b', 'ç', 'd', 'e', 'f', 'g'],
        ['ğ', 'h', 'i', 'í', 'î', 'j', 'k', 'l'],
        ['m', 'n', 'ñ', 'o', 'ó', 'p', 'r', 's'],
        ['ş', 't', 'u', 'ú', 'v', 'w', 'y', 'z'],
    ];

    return (
        <div className="bg-slate-100/80 backdrop-blur-sm p-2 md:p-3 rounded-lg border border-slate-200 mt-4 flex flex-col gap-2" role="toolbar" aria-label="Crimean Tatar keyboard">
            {keyRows.map((row, rowIndex) => (
                 <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
                    {row.map(char => (
                         <button
                            key={char}
                            onClick={() => onKeyPress(char)}
                            className="flex-1 basis-0 min-w-[32px] h-10 md:h-12 text-lg font-medium bg-white text-slate-800 rounded-md hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label={`Insert character ${char}`}
                        >
                            {char}
                        </button>
                    ))}
                </div>
            ))}
             <div className="flex justify-center gap-2 mt-1">
                 <button
                    onClick={onBackspace}
                    className="flex items-center justify-center gap-2 w-36 h-10 md:h-12 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 active:bg-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Backspace"
                >
                    <BackspaceIcon className="h-5 w-5" />
                    <span>Backspace</span>
                </button>
            </div>
        </div>
    );
};

export default Keyboard;