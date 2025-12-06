
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CorpusEntry } from '../types';

interface VirtualKeyboardProps {
    entries: CorpusEntry[];
}

// Layout: q and x present, ç present.
const KEYS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['SHIFT', 'z', 'x', 'ç', 'v', 'b', 'n', 'm', 'BACK'],
    ['123', ',', '😊', 'SPACE', '.', 'ENTER']
];

const NUM_KEYS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '_', '&', '-', '+', '(', ')', '/'],
    ['%', '*', '"', "'", ':', ';', '!', '?', 'BACK'],
    ['ABÇ', ',', '😊', 'SPACE', '.', 'ENTER']
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

// Variants (cleaned up to match QWERTY layout with special chars accessible via long press where needed)
const VARIANTS: { [key: string]: string[] } = {
    'a': ['á'],
    'ç': ['c'], // c on long press
    'g': ['ğ'],
    'i': ['í', 'î'], 
    'n': ['ñ'],
    'o': ['ó'],
    's': ['ş'], 
    't': ['ţ'],
    'u': ['ú'],
    
    // Uppercase
    'A': ['Á'],
    'Ç': ['C'],
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
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    
    // Popup State
    const [activePopup, setActivePopup] = useState<{ key: string, variants: string[] } | null>(null);
    const [highlightedVariant, setHighlightedVariant] = useState<string | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Prediction Model (Bigram + Frequency)
    const predictionModel = useMemo(() => {
        const freqMap = new Map<string, number>();
        const bigramMap = new Map<string, Map<string, number>>();
        const properNouns = new Set<string>();

        // Regex to tokenize:
        // Group 1: Words (alphabetic + dialect characters + apostrophe/hyphen). NO NUMBERS.
        // Group 2: Sentence delimiters (. ? !)
        const tokenizerRegex = /([a-zA-ZáÁçÇğĞíÍîÎñÑóÓşŞúÚţŢ]+(?:['\-][a-zA-ZáÁçÇğĞíÍîÎñÑóÓşŞúÚţŢ]+)*)|([.?!]+)/g;

        // Pass 1: Identify Definite Proper Nouns (capitalized in middle of sentence)
        entries.forEach(entry => {
            const matches = entry.text.matchAll(tokenizerRegex);
            let isStart = true;
            for (const match of matches) {
                if (match[2]) { 
                    isStart = true; 
                    continue; 
                }
                if (match[1]) {
                    const word = match[1];
                    // If capitalized and NOT at start of sentence, it's a proper noun
                    if (!isStart && /^[A-ZÁÇĞÍÎÑÓŞÚŢ]/.test(word)) {
                        properNouns.add(word);
                    }
                    isStart = false;
                }
            }
        });

        // Pass 2: Build Frequency and Bigram Maps
        entries.forEach(entry => {
            const matches = entry.text.matchAll(tokenizerRegex);
            let isStartOfSentence = true;
            let prevWord: string | null = null;
            
            for (const match of matches) {
                const wordToken = match[1];
                const punctToken = match[2];

                if (punctToken) {
                    isStartOfSentence = true;
                    prevWord = null;
                    continue;
                }

                if (wordToken) {
                    let processedWord = wordToken;

                    if (isStartOfSentence) {
                        if (properNouns.has(wordToken)) {
                            processedWord = wordToken;
                        } else {
                            processedWord = wordToken.toLowerCase();
                        }
                    } else {
                        processedWord = wordToken;
                    }

                    freqMap.set(processedWord, (freqMap.get(processedWord) || 0) + 1);

                    if (prevWord) {
                        if (!bigramMap.has(prevWord)) {
                            bigramMap.set(prevWord, new Map());
                        }
                        const nextMap = bigramMap.get(prevWord)!;
                        nextMap.set(processedWord, (nextMap.get(processedWord) || 0) + 1);
                    }
                    
                    prevWord = processedWord;
                    isStartOfSentence = false;
                }
            }
        });

        const sortedBigrams = new Map<string, string[]>();
        bigramMap.forEach((nextMap, currentWord) => {
            const sortedNext = Array.from(nextMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(item => item[0]);
            sortedBigrams.set(currentWord, sortedNext);
        });

        const sortedFreq = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(item => item[0]);

        return { sortedFreq, sortedBigrams };
    }, [entries]);

    useEffect(() => {
        const trimmedInput = input.trimEnd();
        
        if (input.length > 0 && /\s$/.test(input)) {
            const tokens = trimmedInput.split(/\s+/);
            const lastWordRaw = tokens[tokens.length - 1];
            const lastWord = lastWordRaw.replace(/[.?!,;:"'()]/g, ''); 
            
            let suggestionsList: string[] = [];

            if (predictionModel.sortedBigrams.has(lastWord)) {
                suggestionsList = predictionModel.sortedBigrams.get(lastWord)!;
            } else if (predictionModel.sortedBigrams.has(lastWord.toLowerCase())) {
                 suggestionsList = predictionModel.sortedBigrams.get(lastWord.toLowerCase())!;
            } else {
                suggestionsList = predictionModel.sortedFreq.slice(0, 3);
            }
            setSuggestions(suggestionsList);
        } 
        else if (input.trim().length === 0) {
            setSuggestions(predictionModel.sortedFreq.slice(0, 3));
        }
        else {
            const tokens = input.split(/\s+/);
            const lastToken = tokens[tokens.length - 1].toLowerCase();
            
            if (lastToken.length > 0) {
                 const matches = predictionModel.sortedFreq
                    .filter(w => w.toLowerCase().startsWith(lastToken) && w.toLowerCase() !== lastToken)
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

        if (input.length > 0 && /\s$/.test(input)) {
             const newValue = input + word + ' ';
             setInput(newValue);
             requestAnimationFrame(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = newValue.length;
            });
        } else {
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
                const newValue = word + ' ';
                setInput(newValue);
                 requestAnimationFrame(() => {
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = newValue.length;
                });
            }
        }
    };

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

    const handleStandardClick = (key: string) => {
        if (key === 'SHIFT') {
            setIsShift(!isShift);
        } else if (key === 'BACK') {
            handleBackspace();
        } else if (key === '123') {
            setIsNum(true);
            setIsEmoji(false);
        } else if (key === 'ABC' || key === 'ABÇ') {
            setIsNum(false);
            setIsEmoji(false);
        } else if (key === '😊') {
            setIsEmoji(true);
        } else if (key === 'SPACE') {
            handleSpace();
        } else if (key === 'ENTER') {
            handleEnter();
        } else {
            handleInput(key);
        }
    };

    // Unified Press Handling for Popup
    const handlePressStart = (key: string) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        
        // Only start long press if it's a character key with variants
        const variants = VARIANTS[key] || VARIANTS[key.toUpperCase()];
        if (variants && variants.length > 0) {
            longPressTimer.current = setTimeout(() => {
                setActivePopup({ key, variants });
                if (navigator.vibrate) navigator.vibrate(50);
            }, 500); // 500ms delay for long press
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (activePopup) {
            e.preventDefault(); // Prevent scroll while selecting variant
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const variantBtn = element?.closest('[data-variant]');
            if (variantBtn) {
                setHighlightedVariant(variantBtn.getAttribute('data-variant'));
            } else {
                setHighlightedVariant(null);
            }
        }
    };

    const handlePressEnd = (key: string, e?: React.SyntheticEvent) => {
        if (e && e.type !== 'mouseleave') {
             e.preventDefault();
        }
        
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (activePopup) {
            // Popup was open
            if (highlightedVariant) {
                handleInput(highlightedVariant);
            } else {
                // If popup was open but no variant selected (released on main key or outside),
                // type the base key (standard Gboard behavior for release on base)
                handleStandardClick(key);
            }
            // Reset popup state
            setActivePopup(null);
            setHighlightedVariant(null);
        } else {
            // Standard short tap
            handleStandardClick(key);
        }
    };

    const currentLayout = isNum ? NUM_KEYS : KEYS;

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Main Input Area */}
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
                
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-opacity duration-300 ${showCopyFeedback ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    Copied to clipboard!
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col bg-[#F1F3F4] border-t border-slate-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20">
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
                            <div className="flex-1 text-center text-slate-400 text-sm italic"></div>
                        )}
                    </div>
                )}
            </div>

            {/* Keyboard Keys Area */}
            <div className="bg-[#F1F3F4] pb-2 px-1 select-none relative w-full pt-1">
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
                                 ABÇ
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
                                    if (isSpace) widthClass = "flex-[4]";
                                    if (isEnter || isShiftKey || isBack || key === '123' || key === 'ABC' || key === 'ABÇ') widthClass = "flex-[1.5]";

                                    let bgClass = 'bg-white text-slate-900 shadow-[0_1px_1px_rgba(0,0,0,0.3)]';
                                    if (isActionKey) {
                                        if (isEnter) {
                                            bgClass = 'bg-[#4285F4] text-white shadow-[0_1px_1px_rgba(0,0,0,0.3)] active:bg-[#3367D6]';
                                        } else if (isShiftKey && isShift) {
                                            bgClass = 'bg-white text-[#4285F4] shadow-[0_1px_1px_rgba(0,0,0,0.3)] ring-1 ring-[#4285F4]';
                                        } else if (isSpace) {
                                            bgClass = 'bg-white text-slate-900 shadow-[0_1px_1px_rgba(0,0,0,0.3)]';
                                        } else {
                                            bgClass = 'bg-[#DEE1E6] text-slate-800 shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#C8CCD1]';
                                        }
                                    }

                                    // Check if this specific key has an active popup
                                    const isPopupActive = activePopup?.key === displayKey;

                                    return (
                                        <div key={key} className={`${widthClass} relative flex justify-center`}>
                                            {/* Popup Bubble */}
                                            {isPopupActive && (
                                                <div 
                                                    className="absolute bottom-[115%] left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-white rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.2)] p-1.5 gap-1 z-30 animate-fade-in-fast border border-slate-100"
                                                    style={{ minWidth: activePopup.variants.length > 1 ? 'auto' : '48px' }}
                                                >
                                                    {activePopup.variants.map((variant) => (
                                                        <div
                                                            key={variant}
                                                            data-variant={variant}
                                                            className={`
                                                                w-10 h-10 flex items-center justify-center text-xl font-medium rounded-md transition-colors
                                                                ${highlightedVariant === variant ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}
                                                            `}
                                                        >
                                                            {variant}
                                                        </div>
                                                    ))}
                                                    {/* Little triangle arrow at bottom */}
                                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                                                </div>
                                            )}

                                            <button
                                                onMouseDown={(e) => handlePressStart(displayKey)}
                                                onMouseUp={(e) => handlePressEnd(displayKey, e)}
                                                onMouseLeave={(e) => {
                                                    if(longPressTimer.current) {
                                                        clearTimeout(longPressTimer.current);
                                                        longPressTimer.current = null;
                                                    }
                                                }}
                                                onTouchStart={(e) => handlePressStart(displayKey)}
                                                onTouchEnd={(e) => handlePressEnd(displayKey, e)}
                                                onTouchMove={handleTouchMove}
                                                className={`
                                                    w-full h-11 sm:h-12 rounded-[4px] flex items-center justify-center text-xl font-normal transition-all active:translate-y-[1px]
                                                    ${bgClass}
                                                    ${isPopupActive ? 'brightness-95' : ''}
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
                                        </div>
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
