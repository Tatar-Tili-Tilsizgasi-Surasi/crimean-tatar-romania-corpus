
import { CorpusEntry } from '../types';

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
    'sîñ': ' [you are]', 'síñ': ' [you are]',
    'dîr': ' [is]', 'dír': ' [is]', 'tîr': ' [is]', 'tír': ' [is]'
};

// Reverse sort suffixes by length to match longest first
const SORTED_SUFFIXES = Object.keys(SUFFIXES).sort((a, b) => b.length - a.length);

export interface Index {
    ctToOther: Map<string, string[]>;
    otherToCt: Map<string, string[]>;
}

const PUNCTUATION_REGEX = /[.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]/g;
const SPLIT_REGEX = /([\s.,!?;:()"[\]{}«»“”‘’—–\-/_|●•]+)/;

const normalize = (s: string) => {
    return s.toLowerCase()
        // Normalize Romanian variations to match corpus standard (usually cedilla for S, but handle both inputs)
        .replace(/ș/g, 'ş').replace(/Ș/g, 'ş')
        // Normalize T-comma to T-cedilla if it appears, for consistency
        .replace(/ț/g, 'ţ').replace(/Ț/g, 'ţ')
        // Normalize â to î as corpus tends to prefer î
        .replace(/Â/g, 'Î').replace(/â/g, 'î')
        // Strip common punctuation that might still be attached after splitting
        .replace(PUNCTUATION_REGEX, '')
        .trim();
};

export const buildIndex = (entries: CorpusEntry[]): Index => {
    const ctToOther = new Map<string, string[]>();
    const otherToCt = new Map<string, string[]>();

    const addToIndex = (map: Map<string, string[]>, key: string, value: string) => {
        const normKey = normalize(key);
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
             // We replace abbreviations with spaces to avoid merging words when splitting.
             let cleanTranslation = entry.translation
                .replace(/\b(s\.|adj\.|adv\.|v\.|prep\.|conj\.|interj\.|num\.|art\.|fiziol\.|muz\.|electr\.|fiz\.|antrop\. f\.)/g, ' ')
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
    const normWord = normalize(word);
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
    const normText = normalize(text);
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
            if (index.otherToCt.has(normalize(w))) otherHits++;
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
            const normPart = normalize(part);
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
