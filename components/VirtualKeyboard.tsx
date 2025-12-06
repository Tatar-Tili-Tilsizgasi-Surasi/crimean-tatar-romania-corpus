
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CorpusEntry } from '../types';

interface VirtualKeyboardProps {
    entries: CorpusEntry[];
}

const KEYS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACK'],
    ['123', 'SPACE', '.', 'ENTER']
];

const NUM_KEYS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['ABC', '.', ',', '?', '!', "'", 'BACK'],
    ['SPACE', 'ENTER']
];

const VARIANTS: { [key: string]: string[] } = {
    'a': ['á'],
    'c': ['ç'],
    'g': ['ğ'],
    'i': ['í', 'î'],
    'n': ['ñ'],
    'o': ['ó'],
    's': ['ş'],
    't': ['ţ'],
    'u': ['ú'],
    'A': ['Á'],
    'C': ['Ç'],
    'G': ['Ğ'],
    'I': ['Í', 'Î'],
    'N': ['Ñ'],
    'O': ['Ó'],
    'S': ['Ş'],
    'T': ['Ţ'],
    'U': ['Ú']
};

const BackspaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
    </svg>
);

const ShiftIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const EnterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
);

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ entries }) => {
    const [input, setInput] = useState('');
    const [isShift, setIsShift] = useState(false);
    const [isNum, setIsNum] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Extract dictionary for suggestions
    const dictionary = useMemo(() => {
        const wordCounts = new Map<string, number>();
        entries.forEach(entry => {
            const cleanText = entry.text.toLowerCase().replace(/[.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]/g, ' ');
            const words = cleanText.split(/\s+/);
            words.forEach(w => {
                if (w.length > 1) {
                    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
                }
            });
        });
        return Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(item => item[0]);
    }, [entries]);

    useEffect(() => {
        const lastWordMatch = input.match(/(\S+)$/);
        if (lastWordMatch) {
            const prefix = lastWordMatch[1].toLowerCase();
            const matches = dictionary.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 3);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    }, [input, dictionary]);

    const handleInput = (char: string) => {
        const textarea = inputRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        const newValue = input.substring(0, start) + char + input.substring(end);
        setInput(newValue);
        
        requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + char.length;
            textarea.focus();
        });
        
        if (isShift) setIsShift(false);
    };

    const handleBackspace = () => {
        const textarea = inputRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start === end && start > 0) {
            const newValue = input.substring(0, start - 1) + input.substring(end);
            setInput(newValue);
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = start - 1;
                textarea.focus();
            });
        } else if (start !== end) {
             const newValue = input.substring(0, start) + input.substring(end);
             setInput(newValue);
             requestAnimationFrame(() => {
                 textarea.selectionStart = textarea.selectionEnd = start;
                 textarea.focus();
             });
        }
    };

    const handleSpace = () => {
        handleInput(' ');
    };

    const handleEnter = () => {
        handleInput('\n');
    };

    const handleSuggestionClick = (word: string) => {
        const textarea = inputRef.current;
        if (!textarea) return;

        const lastWordMatch = input.match(/(\S+)$/);
        if (lastWordMatch) {
            const matchIndex = lastWordMatch.index!;
            const newValue = input.substring(0, matchIndex) + word + ' ';
            setInput(newValue);
             requestAnimationFrame(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = newValue.length;
            });
        }
    };

    const handleTouchStart = (key: string) => {
        if (VARIANTS[key] || VARIANTS[key.toUpperCase()]) {
             longPressTimer.current = setTimeout(() => {
                 setActiveVariantKey(key);
             }, 400); // Slightly faster trigger for better feel
        }
    };

    const handleTouchEnd = (key: string) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (!activeVariantKey) {
            if (key === 'SHIFT') setIsShift(!isShift);
            else if (key === 'BACK') handleBackspace();
            else if (key === '123' || key === 'ABC') setIsNum(!isNum);
            else if (key === 'SPACE') handleSpace();
            else if (key === 'ENTER') handleEnter();
            else handleInput(key);
        }
    };
    
    const handleMouseDown = (key: string) => handleTouchStart(key);
    const handleMouseUp = (key: string) => handleTouchEnd(key);

    const handleVariantSelect = (variant: string) => {
        handleInput(variant);
        setActiveVariantKey(null);
    };

    const currentLayout = isNum ? NUM_KEYS : KEYS;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Input Area */}
            <div className="flex-grow p-4 relative overflow-hidden">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-full text-xl bg-transparent border-none focus:ring-0 resize-none font-sans text-slate-800 p-2"
                    placeholder="Type in Crimean Tatar..."
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                />
            </div>

            {/* Suggestions Strip */}
            <div className="h-12 bg-[#F2F4F5] border-t border-slate-200 flex items-center justify-evenly w-full z-10">
                {suggestions.length > 0 ? (
                    suggestions.slice(0, 3).map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSuggestionClick(s)}
                            className="flex-1 py-2 text-center text-slate-800 font-medium text-lg active:bg-slate-200 transition-colors truncate px-2 border-r border-slate-300 last:border-none"
                        >
                            {s}
                        </button>
                    ))
                ) : (
                    <div className="flex-1 text-center text-slate-400 text-sm italic">
                        Suggestions appear here
                    </div>
                )}
            </div>

            {/* Keyboard Area */}
            <div className="bg-[#ECEFF1] pb-3 pt-2 px-1 select-none relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] w-full">
                 {/* Variants Popup */}
                 {activeVariantKey && (
                    <div 
                        className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none"
                        style={{ bottom: '100%', marginBottom: '-20px' }} // Position overlapping slightly or just above
                    >
                        <div className="bg-white p-2 rounded-xl shadow-2xl flex gap-1 animate-fade-in-fast mb-4 border border-slate-100 pointer-events-auto">
                             {VARIANTS[isShift ? activeVariantKey.toUpperCase() : activeVariantKey].map(v => (
                                 <button
                                    key={v}
                                    className="w-10 h-12 flex items-center justify-center text-xl font-bold bg-slate-50 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors border border-slate-200 shadow-sm"
                                    onClick={() => handleVariantSelect(v)}
                                 >
                                     {v}
                                 </button>
                             ))}
                             <button 
                                onClick={() => setActiveVariantKey(null)} 
                                className="w-10 h-12 flex items-center justify-center text-slate-400 font-bold hover:text-red-500"
                             >
                                 ✕
                             </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
                    {currentLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1.5 w-full px-1">
                            {row.map((key) => {
                                const displayKey = isShift && key.length === 1 ? key.toUpperCase() : key;
                                const isSpecial = key.length > 1;
                                const isEnter = key === 'ENTER';
                                const isShiftKey = key === 'SHIFT';
                                const isBack = key === 'BACK';
                                const isSpace = key === 'SPACE';
                                
                                let widthClass = "flex-1";
                                if (isSpace) widthClass = "flex-[4]";
                                if (isEnter || isShiftKey || isBack || key === '123' || key === 'ABC') widthClass = "flex-[1.5]";

                                // Gboard Style Colors
                                let bgClass = 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)]'; // Standard key
                                if (isSpecial) {
                                    if (isEnter) {
                                        bgClass = 'bg-cyan-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] active:bg-cyan-700';
                                    } else if (isShiftKey && isShift) {
                                        bgClass = 'bg-white text-cyan-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)] border-2 border-cyan-600'; // Active shift
                                    } else if (isSpace) {
                                        bgClass = 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)]'; // Space is usually white
                                    } else {
                                        bgClass = 'bg-[#D1D5DB] text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.2)] active:bg-[#9CA3AF]'; // Functional keys (grey)
                                    }
                                }

                                return (
                                    <button
                                        key={key}
                                        onMouseDown={(e) => { e.preventDefault(); handleMouseDown(displayKey); }}
                                        onMouseUp={(e) => { e.preventDefault(); handleMouseUp(displayKey); }}
                                        onMouseLeave={() => { if(longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
                                        onTouchStart={(e) => { e.preventDefault(); handleTouchStart(displayKey); }}
                                        onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(displayKey); }}
                                        className={`
                                            ${widthClass} h-12 sm:h-14 rounded-lg flex items-center justify-center text-xl font-medium transition-all active:scale-[0.98]
                                            ${bgClass}
                                        `}
                                    >
                                        {isBack ? <BackspaceIcon /> : 
                                         isShiftKey ? <ShiftIcon active={isShift} /> : 
                                         isEnter ? <EnterIcon /> : 
                                         isSpace ? '' : 
                                         displayKey}
                                        {/* Visual hint for variants */}
                                        {!isSpecial && (VARIANTS[key] || VARIANTS[key.toUpperCase()]) && (
                                            <span className="absolute top-1 right-1 text-[8px] text-slate-400">...</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;
