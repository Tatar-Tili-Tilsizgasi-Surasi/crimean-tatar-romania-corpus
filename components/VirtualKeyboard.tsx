
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CorpusEntry } from '../types';

interface VirtualKeyboardProps {
    entries: CorpusEntry[];
}

const KEYS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACK'],
    ['123', ',', '😊', 'SPACE', '.', 'ENTER']
];

const NUM_KEYS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/'],
    ['%', '*', '"', "'", ':', ';', '!', '?', 'BACK'],
    ['ABC', ',', '😊', 'SPACE', '.', 'ENTER']
];

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗",
  "😋", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
  "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
  "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐",
  "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
  "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁", "💋",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
  "🔥", "✨", "🌟", "💫", "💥", "💢", "💦", "💧", "💤", "🕳", "🎉", "🎊", "🎈", "🎂", "🎁", "🕯", "🎃", "👻",
  "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🌿", "🍀", "🍁", "🍂", "🍃", "🌍", "🌎", "🌏", "🌙", "🌚", "🌝", "☀️",
  "🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦄"
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

// Icons
const BackspaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
    </svg>
);

const ShiftIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const EnterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ entries }) => {
    const [input, setInput] = useState('');
    const [isShift, setIsShift] = useState(false);
    const [isNum, setIsNum] = useState(false);
    const [isEmoji, setIsEmoji] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Prediction Model (Bigram + Frequency)
    const predictionModel = useMemo(() => {
        const freqMap = new Map<string, number>();
        const bigramMap = new Map<string, Map<string, number>>();

        entries.forEach(entry => {
            // Clean text: remove numbers, punctuation (keep apostrophes/hyphens inside words if valid, but mostly remove)
            // We use entry.text which is the CT text.
            const cleanText = entry.text
                .toLowerCase()
                .replace(/[0-9.,!?;:()"[\]{}«»“”‘’—–/_|●•]/g, ' ') // Replace punctuation with space
                .replace(/\s+/g, ' ')
                .trim();
            
            const words = cleanText.split(' ').filter(w => w.length > 0);
            
            words.forEach((word, index) => {
                // Update Frequency
                freqMap.set(word, (freqMap.get(word) || 0) + 1);

                // Update Bigram (Next Word)
                if (index < words.length - 1) {
                    const nextWord = words[index + 1];
                    if (!bigramMap.has(word)) {
                        bigramMap.set(word, new Map());
                    }
                    const nextMap = bigramMap.get(word)!;
                    nextMap.set(nextWord, (nextMap.get(nextWord) || 0) + 1);
                }
            });
        });

        // Convert bigram maps to sorted arrays for fast lookup
        const sortedBigrams = new Map<string, string[]>();
        bigramMap.forEach((nextMap, currentWord) => {
            const sortedNext = Array.from(nextMap.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .slice(0, 5) // Keep top 5 next words
                .map(item => item[0]);
            sortedBigrams.set(currentWord, sortedNext);
        });

        // Convert freq map to sorted array
        const sortedFreq = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(item => item[0]);

        return { sortedFreq, sortedBigrams };
    }, [entries]);

    useEffect(() => {
        const trimmedInput = input.trimEnd(); // Don't trim start, but ignore trailing spaces for "last word" check if typing
        
        // Case 1: Input ends with whitespace -> User finished a word, suggest NEXT word
        if (input.length > 0 && /\s$/.test(input)) {
            const tokens = trimmedInput.split(/\s+/);
            const lastWord = tokens[tokens.length - 1].toLowerCase().replace(/[.,!?;:]/g, ''); // strip punct from last word for lookup
            
            if (predictionModel.sortedBigrams.has(lastWord)) {
                setSuggestions(predictionModel.sortedBigrams.get(lastWord)!);
            } else {
                // Fallback to top frequency words if no bigram exists
                setSuggestions(predictionModel.sortedFreq.slice(0, 3));
            }
        } 
        // Case 2: Input is empty -> Suggest top frequency words
        else if (input.trim().length === 0) {
            setSuggestions(predictionModel.sortedFreq.slice(0, 3));
        }
        // Case 3: Typing a word -> Suggest completions
        else {
            const tokens = input.split(/\s+/); // don't trim input here, we want the raw last token
            const lastToken = tokens[tokens.length - 1].toLowerCase();
            
            if (lastToken.length > 0) {
                 const matches = predictionModel.sortedFreq
                    .filter(w => w.startsWith(lastToken) && w !== lastToken)
                    .slice(0, 3);
                setSuggestions(matches);
            } else {
                setSuggestions([]);
            }
        }
    }, [input, predictionModel]);

    // Handlers
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
        
        // Reset shift but allow emoji/num state to persist if needed
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

    const handleSpace = () => handleInput(' ');
    const handleEnter = () => handleInput('\n');

    const handleSuggestionClick = (word: string) => {
        const textarea = inputRef.current;
        if (!textarea) return;

        // Determine if we are completing a word or adding a new one
        if (input.length > 0 && /\s$/.test(input)) {
            // Adding a next-word prediction
             const newValue = input + word + ' ';
             setInput(newValue);
             requestAnimationFrame(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = newValue.length;
            });
        } else {
            // Completing current word
            const lastWordMatch = input.match(/(\S+)$/);
            if (lastWordMatch) {
                const matchIndex = lastWordMatch.index!;
                const newValue = input.substring(0, matchIndex) + word + ' ';
                setInput(newValue);
                requestAnimationFrame(() => {
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = newValue.length;
                });
            } else {
                // Edge case: Empty input but suggestion clicked (e.g., from top freq)
                const newValue = word + ' ';
                setInput(newValue);
                 requestAnimationFrame(() => {
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = newValue.length;
                });
            }
        }
    };

    // Actions
    const handleCopy = () => {
        if (!input) return;
        navigator.clipboard.writeText(input).then(() => {
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        });
    };

    const handleShare = async () => {
        if (!input) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    text: input,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            handleCopy();
            alert('Sharing not supported on this device/browser. Text copied to clipboard instead!');
        }
    };

    const handleClear = () => {
        if (window.confirm('Clear all text?')) {
            setInput('');
            inputRef.current?.focus();
        }
    };

    // Touch logic
    const handleTouchStart = (key: string) => {
        if (VARIANTS[key] || VARIANTS[key.toUpperCase()]) {
             longPressTimer.current = setTimeout(() => {
                 setActiveVariantKey(key);
             }, 400); 
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
            else if (key === '123') { setIsNum(true); setIsEmoji(false); }
            else if (key === 'ABC') { setIsNum(false); setIsEmoji(false); }
            else if (key === '😊') { setIsEmoji(true); }
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
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Main Input Area (Like a notepad) */}
            <div className="flex-grow flex flex-col relative bg-white">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-full text-xl bg-transparent border-none focus:ring-0 resize-none font-sans text-slate-900 p-4 leading-relaxed"
                    placeholder="Type here..."
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    inputMode="none"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                
                {/* Floating feedback toast */}
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-opacity duration-300 ${showCopyFeedback ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    Copied to clipboard!
                </div>
            </div>

            {/* Toolbar (Actions + Suggestions) */}
            <div className="flex flex-col bg-[#F1F3F4] border-t border-slate-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20">
                
                {/* Action Bar */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-200/50">
                    <div className="flex gap-1">
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 rounded-full shadow-sm text-sm font-medium active:bg-slate-100"
                        >
                            <ShareIcon />
                            Share
                        </button>
                        <button 
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 rounded-full shadow-sm text-sm font-medium active:bg-slate-100"
                        >
                            <CopyIcon />
                            Copy
                        </button>
                    </div>
                    <button 
                        onClick={handleClear}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Clear"
                    >
                        <TrashIcon />
                    </button>
                </div>

                {/* Suggestions Strip - Only show if not in Emoji mode */}
                {!isEmoji && (
                    <div className="h-10 flex items-center w-full">
                        {suggestions.length > 0 ? (
                            <div className="flex w-full divide-x divide-slate-300/50">
                                {suggestions.slice(0, 3).map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSuggestionClick(s)}
                                        className="flex-1 text-center text-slate-800 font-medium text-lg active:bg-slate-200 transition-colors truncate px-1"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 text-center text-slate-400 text-sm italic">
                                
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Keyboard Keys Area */}
            <div className="bg-[#F1F3F4] pb-2 px-1 select-none relative w-full pt-1">
                 
                 {/* Emoji View */}
                 {isEmoji ? (
                     <div className="flex flex-col h-[220px] sm:h-[240px]">
                         <div className="flex-grow overflow-y-auto grid grid-cols-8 gap-1 p-2 content-start">
                             {EMOJIS.map(emoji => (
                                 <button 
                                     key={emoji}
                                     onClick={() => handleInput(emoji)}
                                     className="h-10 text-2xl flex items-center justify-center hover:bg-slate-200 rounded"
                                 >
                                     {emoji}
                                 </button>
                             ))}
                         </div>
                         <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-200">
                             <button 
                                 onClick={() => setIsEmoji(false)} 
                                 className="flex-[1.5] h-11 rounded-[4px] flex items-center justify-center text-sm font-bold bg-[#DEE1E6] text-slate-800 shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#C8CCD1]"
                             >
                                 ABC
                             </button>
                             <div className="flex-[4] px-2 text-center text-xs text-slate-500">Emojis</div>
                             <button 
                                 onClick={handleBackspace} 
                                 className="flex-[1.5] h-11 rounded-[4px] flex items-center justify-center bg-[#DEE1E6] text-slate-800 shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#C8CCD1]"
                             >
                                 <BackspaceIcon />
                             </button>
                         </div>
                     </div>
                 ) : (
                    <>
                    {/* Variants Popup Bubble */}
                    {activeVariantKey && (
                        <div 
                            className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none"
                            style={{ bottom: '100%', marginBottom: '-40px' }}
                        >
                            <div className="bg-white p-2 rounded-xl shadow-xl flex gap-1 animate-fade-in-fast mb-12 border border-slate-100 pointer-events-auto">
                                {VARIANTS[isShift ? activeVariantKey.toUpperCase() : activeVariantKey].map(v => (
                                    <button
                                        key={v}
                                        className="w-10 h-12 flex items-center justify-center text-xl font-bold bg-slate-50 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-slate-200 shadow-sm"
                                        onClick={() => handleVariantSelect(v)}
                                    >
                                        {v}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setActiveVariantKey(null)} 
                                    className="w-10 h-12 flex items-center justify-center text-slate-400 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 max-w-3xl mx-auto w-full">
                        {currentLayout.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1.5 w-full px-0.5">
                                {row.map((key) => {
                                    const displayKey = isShift && key.length === 1 ? key.toUpperCase() : key;
                                    const isEnter = key === 'ENTER';
                                    const isShiftKey = key === 'SHIFT';
                                    const isBack = key === 'BACK';
                                    const isSpace = key === 'SPACE';
                                    const isActionKey = key.length > 1 || key === '😊';
                                    
                                    let widthClass = "flex-1";
                                    if (isSpace) widthClass = "flex-[4]"; // Slightly smaller space to accommodate emoji key
                                    if (isEnter || isShiftKey || isBack || key === '123' || key === 'ABC') widthClass = "flex-[1.5]";

                                    // Gboard Colors
                                    let bgClass = 'bg-white text-slate-900 shadow-[0_1px_1px_rgba(0,0,0,0.3)]'; // Standard key
                                    if (isActionKey) {
                                        if (isEnter) {
                                            bgClass = 'bg-[#4285F4] text-white shadow-[0_1px_1px_rgba(0,0,0,0.3)] active:bg-[#3367D6]';
                                        } else if (isShiftKey && isShift) {
                                            bgClass = 'bg-white text-[#4285F4] shadow-[0_1px_1px_rgba(0,0,0,0.3)] ring-1 ring-[#4285F4]'; // Active shift
                                        } else if (isSpace) {
                                            bgClass = 'bg-white text-slate-900 shadow-[0_1px_1px_rgba(0,0,0,0.3)]'; // Space
                                        } else {
                                            bgClass = 'bg-[#DEE1E6] text-slate-800 shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#C8CCD1]'; // Functional keys
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
                                                ${widthClass} h-11 sm:h-12 rounded-[4px] flex items-center justify-center text-xl font-normal transition-all active:translate-y-[1px]
                                                ${bgClass}
                                            `}
                                        >
                                            {isBack ? <BackspaceIcon /> : 
                                            isShiftKey ? <ShiftIcon active={isShift} /> : 
                                            isEnter ? <EnterIcon /> : 
                                            isSpace ? <span className="text-sm font-medium text-slate-500">Kîrîm Tatarşa</span> : 
                                            displayKey}
                                            
                                            {!isActionKey && (VARIANTS[key] || VARIANTS[key.toUpperCase()]) && (
                                                <span className="absolute top-1 right-1 text-[7px] text-slate-300">...</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    </>
                 )}
            </div>
        </div>
    );
};

export default VirtualKeyboard;
