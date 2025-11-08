
import { CorpusEntry } from '../types';

// Normalized Suffixes for Romania dialect (simplified)
// Used to analyze CT input and provide rough translations + grammatical notes.
const SUFFIXES: { [key: string]: string } = {
    'lar': ' [plural]', 'ler': ' [plural]',
    'nıñ': ' [gen]', 'niñ': ' [gen]', 'nuñ': ' [gen]', 'nüñ': ' [gen]',
    'ga': ' [dat]', 'ge': ' [dat]', 'ka': ' [dat]', 'ke': ' [dat]', 'ğa': ' [dat]', 'ğe': ' [dat]',
    'da': ' [loc]', 'de': ' [loc]', 'ta': ' [loc]', 'te': ' [loc]',
    'dan': ' [abl]', 'den': ' [abl]', 'tan': ' [abl]', 'ten': ' [abl]',
    'nı': ' [acc]', 'ni': ' [acc]', 'nu': ' [acc]', 'nü': ' [acc]',
    // Possessive (simplified)
    'ım': ' [my]', 'im': ' [my]', 'um': ' [my]', 'üm': ' [my]',
    'ıñ': ' [your]', 'iñ': ' [your]', 'uñ': ' [your]', 'üñ': ' [your]',
    'sı': ' [its]', 'si': ' [its]', 'su': ' [its]', 'sü': ' [its]',
    // Copula / "to be"
    'man': ' [I am]', 'men': ' [I am]',
    'sıñ': ' [you are]', 'siñ': ' [you are]',
    'dır': ' [is]', 'dir': ' [is]', 'tır': ' [is]', 'tir': ' [is]'
};

// Reverse sort suffixes by length to match longest first
const SORTED_SUFFIXES = Object.keys(SUFFIXES).sort((a, b) => b.length - a.length);

export interface Index {
    ctToOther: Map<string, string[]>;
    otherToCt: Map<string, string[]>;
}

const normalize = (s: string) => s.toLowerCase().replace(/ș/g, 'ş').replace(/ț/g, 't').replace(/[.,!?;()"]/g, '').trim();

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
             // Clean up translation for better reverse keywords
             // Remove common abbreviation markers and parenthetical notes for keyword indexing
             let cleanTranslation = entry.translation
                .replace(/\b(s\.|adj\.|adv\.|v\.|prep\.|conj\.|interj\.|num\.|art\.|fiziol\.|muz\.|electr\.|fiz\.|antrop\. f\.)/g, ' ')
                .replace(/\b\d+\./g, ' ')
                .replace(/\(.*?\)/g, ' ');
            
             // Split Romanian/Other definitions by common delimiters
             const parts = cleanTranslation.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 1);
             parts.forEach(part => {
                 addToIndex(otherToCt, part, entry.text);
             });
        }
    });

    return { ctToOther, otherToCt };
};

const findBestCTMatch = (word: string, index: Index): string | null => {
    const normWord = normalize(word);
    // 1. Exact match
    if (index.ctToOther.has(normWord)) {
        return index.ctToOther.get(normWord)![0];
    }

    // 2. Stemming (1 level)
    for (const suffix of SORTED_SUFFIXES) {
        if (normWord.endsWith(suffix)) {
            const stem = normWord.slice(0, -suffix.length);
            if (index.ctToOther.has(stem)) {
                return index.ctToOther.get(stem)![0] + SUFFIXES[suffix];
            }
             // 3. Stemming (2 levels)
             for (const suffix2 of SORTED_SUFFIXES) {
                 if (stem.endsWith(suffix2)) {
                     const stem2 = stem.slice(0, -suffix2.length);
                      if (index.ctToOther.has(stem2)) {
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
    let direction = forceDirection;
    if (!direction) {
        const words = text.split(/\s+/);
        let ctHits = 0;
        let otherHits = 0;
        words.forEach(w => {
            if (findBestCTMatch(w, index)) ctHits++;
            if (index.otherToCt.has(normalize(w))) otherHits++;
        });

        // Boost CT if special chars present
        if (/[áçğíîñóşú]/.test(text)) ctHits += 2;

        direction = ctHits >= otherHits ? 'fromCT' : 'toCT';
    }

    // 3. Word-by-word translation
    // Split by whitespace and common punctuation to preserve structure
    const words = text.split(/(\s+|[.,!?;"]+)/);
    const translatedWords = words.map(part => {
        if (!part.trim() || /^[.,!?;"]+$/.test(part)) return part; 

        if (direction === 'fromCT') {
            const match = findBestCTMatch(part, index);
            return match || part;
        } else {
            // Simple reverse lookup
            const normPart = normalize(part);
            if (index.otherToCt.has(normPart)) {
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
