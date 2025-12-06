
import { CorpusEntry } from '../types';
import { POS_PREFIXES_FOR_CLEANING } from '../data/promptData';

// Normalized Suffixes for Romania dialect (simplified)
// Used to analyze CT input and provide rough translations + grammatical notes.
const SUFFIXES: { [key: string]: string } = {
    'lar': ' [plural]', 'ler': ' [plural]',
    'nîñ': ' [gen]', 'níñ': ' [gen]', 'nuñ': ' [gen]', 'núñ': ' [gen]',
    'ga': ' [dat]', 'ge': ' [dat]', 'ka': ' [dat]', 'ke': ' [dat]',
    'da': ' [loc]', 'de': ' [loc]', 'ta': ' [loc]', 'te': ' [loc]',
    'dan': ' [abl]', 'den': ' [abl]', 'tan': ' [abl]', 'ten': ' [abl]',
    'nî': ' [acc]', 'ní': ' [acc]',
    // Possessive (simplified)
    'îm': ' [my]', 'ím': ' [my]', 'um': ' [my]', 'úm': ' [my]',
    'îñ': ' [your]', 'íñ': ' [your]', 'uñ': ' [your]', 'úñ': ' [your]',
    'sî': ' [its]', 'sí': ' [its]', 'su': ' [its]', 'sú': ' [its]',
    // Copula / "to be"
    'man': ' [I am]', 'men': ' [I am]',
    'sîñ': ' [you are]', 'siñ': ' [you are]',
    'dîr': ' [is]', 'dír': ' [is]', 'tîr': ' [is]', 'tír': ' [is]'
};

// Reverse sort suffixes by length to match longest first
const SORTED_SUFFIXES = Object.keys(SUFFIXES).sort((a, b) => b.length - a.length);

export interface Index {
    ctToOther: Map<string, string[]>;
    otherToCt: Map<string, string[]>;
}

export interface AnalysisResult {
    originalWord: string;
    matches: CorpusEntry[];
}

const PUNCTUATION_REGEX = /[.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]/g;
const SPLIT_REGEX = /([\s.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]+)/;

// Sort prefixes longest first to avoid partial replacements (e.g. replacing "s." inside "s.n.")
const SORTED_POS_PREFIXES = [...POS_PREFIXES_FOR_CLEANING].sort((a, b) => b.length - a.length);

// Exporting for use in deep analysis if needed elsewhere, but primarily internal here.
export const normalize = (s: string) => {
    return s.toLowerCase()
        // Normalize Romanian variations to match corpus standard (usually cedilla for S, but handle both inputs)
        .replace(/ș/g, 'ş').replace(/Ș/g, 'ş')
        // Normalize T-comma to T-cedilla if it appears, for consistency
        .replace(/ț/g, 'ţ').replace(/Ț/g, 'ţ')
        // Normalize â to î as corpus tends to prefer î
        .replace(/Â/g, 'Î').replace(/â/g, 'î')
        // Strip common punctuation that might still be attached after splitting
        .replace(PUNCTUATION_REGEX, ' ') // Replace with space to avoid merging words
        .trim();
};

export const buildIndex = (entries: CorpusEntry[]): Index => {
    const ctToOther = new Map<string, string[]>();
    const otherToCt = new Map<string, string[]>();

    const addToIndex = (map: Map<string, string[]>, key: string, value: string) => {
        const normKey = normalize(key).replace(/\s+/g, ''); // Strict normalization for index keys
        if (!normKey) return;
        if (!map.has(normKey)) {
            map.set(normKey, []);
        }
        // Avoid exact duplicates in the list
        if (!map.get(normKey)!.includes(value)) {
            map.get(normKey)!.push(value);
        }
    };

    entries.forEach(entry => {
        if (!entry.translation) return;

        addToIndex(ctToOther, entry.text, entry.translation);
        // For full phrase reverse lookup
        addToIndex(otherToCt, entry.translation, entry.text);

        // Enhanced indexing for dictionary entries
        if (entry.source.includes('Dictionary')) {
             // Clean up translation for better reverse keywords.
             let cleanTranslation = entry.translation;

             // Iterate and replace each POS prefix with a space.
             // We use a simple replaceAll (or split/join for broader compatibility if needed, though modern JS has replaceAll)
             // Since we want to replace globally, and some might have regex special chars (like dot), we need care.
             // A loop with split/join is safe and effective for this defined list.
             for (const prefix of SORTED_POS_PREFIXES) {
                  // Only replace if it's likely a true prefix (start of string or preceded by space/punctuation)
                  // Actually, given the erratic nature of some dictionary entries, a simple global replace might be safest
                  // to catch them even if formatting is slightly off, as long as the prefix itself is distinct enough.
                  // Most prefixes in the list end with space or dot, making them relatively distinct.
                  cleanTranslation = cleanTranslation.split(prefix).join(' ');
             }

             cleanTranslation = cleanTranslation
                // Remove numbered lists like "1.", "2."
                .replace(/\b\d+\./g, ' ')
                // Remove parenthetical info
                .replace(/\(.*?\)/g, ' ');
            
             // Split Romanian/Other definitions by common delimiters (semicolon, comma, slash, AND PERIOD)
             // Adding period '.' to delimiters ensures words at the end of a definition (e.g., "tradiţie.") are correctly indexed without the dot.
             const parts = cleanTranslation.split(/[;,/.]/).map(s => s.trim()).filter(s => s.length > 0);
             parts.forEach(part => {
                 addToIndex(otherToCt, part, entry.text);
             });
        }
    });

    return { ctToOther, otherToCt };
};

const findBestCTMatch = (word: string, index: Index): string | null => {
    const normWord = normalize(word).replace(/\s+/g, '');
    if (!normWord) return null;

    // 1. Exact match
    if (index.ctToOther.has(normWord)) {
        return index.ctToOther.get(normWord)![0];
    }

    // 2. Stemming (1 level)
    for (const suffix of SORTED_SUFFIXES) {
        if (normWord.endsWith(suffix)) {
            const stem = normWord.slice(0, -suffix.length);
            // Ensure stem has some length to avoid over-stemming short words
            if (stem.length < 2) continue; 

            if (index.ctToOther.has(stem)) {
                return index.ctToOther.get(stem)![0] + SUFFIXES[suffix];
            }
             // 3. Stemming (2 levels) - e.g. plural + case
             for (const suffix2 of SORTED_SUFFIXES) {
                 if (stem.endsWith(suffix2)) {
                     const stem2 = stem.slice(0, -suffix2.length);
                     if (stem2.length < 2) continue;

                      if (index.ctToOther.has(stem2)) {
                         // Note: Order of suffixes in output is rough approximation
                         return index.ctToOther.get(stem2)![0] + SUFFIXES[suffix2] + SUFFIXES[suffix];
                     }
                 }
             }
        }
    }
    return null;
};

export const translateText = (text: string, index: Index, forceDirection?: 'toCT' | 'fromCT'): { translation: string, detectedLang: string } => {
    if (!text.trim()) return { translation: '', detectedLang: 'unknown' };

    // 1. Try exact phrase match first (both directions)
    const normText = normalize(text).replace(/\s+/g, '');
    if (!forceDirection || forceDirection === 'fromCT') {
        if (index.ctToOther.has(normText)) {
            return { translation: index.ctToOther.get(normText)![0], detectedLang: 'Crimean Tatar' };
        }
    }
    if (!forceDirection || forceDirection === 'toCT') {
        if (index.otherToCt.has(normText)) {
             return { translation: index.otherToCt.get(normText)![0], detectedLang: 'Other (Ro/En)' };
        }
    }

    // 2. Auto-detect direction if not forced, based on word hit rate
    // More robust tokenization for detection: split by any non-word-like char
    const detectionWords = text.split(SPLIT_REGEX).filter(w => w.trim().length > 0 && !PUNCTUATION_REGEX.test(w));
    let direction = forceDirection;
    if (!direction) {
        let ctHits = 0;
        let otherHits = 0;
        
        detectionWords.forEach(w => {
            if (findBestCTMatch(w, index)) ctHits++;
            // Simple exact match for reverse, could add basic stemming here too if needed for Romanian
            if (index.otherToCt.has(normalize(w).replace(/\s+/g, ''))) otherHits++;
        });

        // Boost CT if characteristic special chars are present
        if (/[áçğíîñóşúÁÇĞÍÎÑÓŞÚ]/.test(text)) ctHits += 2;

        // Default to 'toCT' (Other -> CT) if no strong signal, as users often try foreign words first.
        // If hits are equal and > 0, prefer CT (assume they might be testing known words).
        if (ctHits === 0 && otherHits === 0) {
             direction = 'toCT'; // Default assumption
        } else {
             direction = ctHits >= otherHits ? 'fromCT' : 'toCT';
        }
    }

    // 3. Word-by-word translation
    // Split while KEEPING delimiters to preserve text structure (spaces, punctuation, newlines)
    const words = text.split(SPLIT_REGEX);
    
    const translatedWords = words.map(part => {
        // If it's just delimiters or empty, return as is
        if (!part.trim() || SPLIT_REGEX.test(part)) return part;

        if (direction === 'fromCT') {
            const match = findBestCTMatch(part, index);
            return match || part;
        } else {
            // Simple reverse lookup
            const normPart = normalize(part).replace(/\s+/g, '');
            if (index.otherToCt.has(normPart)) {
                // If multiple translations exist, just take the first one for now
                return index.otherToCt.get(normPart)![0];
            }
            return part;
        }
    });

    return { 
        translation: translatedWords.join(''),
        detectedLang: direction === 'fromCT' ? 'Crimean Tatar' : 'Other (Ro/En)'
    };
};

// Deep analysis of every word in the input text against the entire corpus
export const analyzeTextDeep = (text: string, entries: CorpusEntry[]): AnalysisResult[] => {
    if (!text.trim()) return [];

    // Split by space and common punctuation to get individual words for analysis
    const rawWords = text.toLowerCase().split(/[\s.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]+/);
    // Filter out very short words (<= 1 char) to reduce noise.
    const uniqueWords = [...new Set(rawWords.filter(w => w.trim().length > 1))];

    return uniqueWords.map(word => {
        // Normalize the search word. removing all spaces for strict word comparison if needed,
        // but 'normalize' replaces punctuation with space, so trim it.
        const normWord = normalize(word).trim();
        if (!normWord) return { originalWord: word, matches: [] };

        // Find all entries where this word appears in text or translation
        const matches = entries.filter(entry => {
            // Normalize entry fields for comparison.
            // We keep spaces to ensure we don't accidentally merge words (e.g. "a det" vs "adet")
            const normText = normalize(entry.text);
            const normTrans = entry.translation ? normalize(entry.translation) : '';

            // Simple 'includes' check as requested to find the word "inside" entries.
            // A more advanced version could use regex with word boundaries (\b) for better precision.
            return normText.includes(normWord) || normTrans.includes(normWord);
        });

        // Sort matches to prioritize exact matches or dictionary entries
        matches.sort((a, b) => {
             const aTextNorm = normalize(a.text).trim();
             const aTransNorm = a.translation ? normalize(a.translation).trim() : '';
             
             // Give higher priority to exact whole-field matches
             const aExact = aTextNorm === normWord || aTransNorm === normWord;
             const bTextNorm = normalize(b.text).trim();
             const bTransNorm = b.translation ? normalize(b.translation).trim() : '';
             const bExact = bTextNorm === normWord || bTransNorm === normWord;

             if (aExact && !bExact) return -1;
             if (!aExact && bExact) return 1;

             // Then prioritize dictionary sources
             const aIsDict = a.source.includes('Dictionary');
             const bIsDict = b.source.includes('Dictionary');
             if (aIsDict && !bIsDict) return -1;
             if (!aIsDict && bIsDict) return 1;

             return 0;
        });

        return { originalWord: word, matches: matches.slice(0, 10) }; // Limit to top 10 matches per word to avoid overwhelming UI
    }).filter(res => res.matches.length > 0);
};
