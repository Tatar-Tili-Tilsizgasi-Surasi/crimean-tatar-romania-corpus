import { CorpusEntry } from '../types';
import { dictionaryRawText } from '../data/dictionary';
import { mikayilEmineskuwEntries } from '../data/Mikayil_Emineskuw';
import { tanerMuratEntries } from '../data/Taner_Murat';
import { friedrichSchillerEntries } from '../data/Friedrich_Schiller';
import { charlesBaudelaireEntries } from '../data/Charles_Baudelaire';

let idCounter = 0;

// List of part-of-speech abbreviations used to detect translations when '/' is missing.
const posAbbreviations = [
    's\\.', 'adj\\.', 'adv\\.', 'pron\\.', 'v\\.', 'interj\\.', 'prep\\.', 'conj\\.', 'num\\.', 'art\\.',
    '\\(fiziol\\.\\)', '\\(muz\\.\\)', '\\(electr\\.\\)', '\\(antrop\\. f\\.\\)', '\\(fiz\\.\\)'
];
const posAbbreviationsRegex = new RegExp(`\\s+(${posAbbreviations.join('|')})`);

const processWordVariations = (word: string): string[] => {
    const slashParts = word.split('/');
    let finalVariations: string[] = [];

    const expandParentheses = (w: string): string[] => {
        const match = w.match(/(.*?)\(([^)]+)\)(.*)/);
        if (!match) {
            return [w];
        }
        const [, prefix, optional, suffix] = match;
        const withOptional = expandParentheses(prefix + optional + suffix);
        const withoutOptional = expandParentheses(prefix + suffix);
        return [...new Set([...withOptional, ...withoutOptional])];
    };

    slashParts.forEach(part => {
        finalVariations.push(...expandParentheses(part));
    });
    
    return [...new Set(finalVariations)];
};

const processTextVariations = (rawText: string): string[] => {
    const trimmedText = rawText.trim();
    if (!trimmedText) return [];
    const wordList = trimmedText.split(/\s+/);

    const wordVariations = wordList.map(processWordVariations);

    // FIX: The original implementation of `cartesian` was a clever one-liner using `reduce`
    // without an initial value. This caused TypeScript errors because the accumulator's type
    // changes between the first and subsequent iterations, which `reduce`'s type signature
    // does not support well. This has been replaced with a more explicit and type-safe
    // implementation that correctly handles the initial state.
    const cartesian = <T>(...a: T[][]): T[][] => {
        if (!a || a.length === 0) {
            return [];
        }
        const [head, ...tail] = a;
        return tail.reduce(
            (acc, current) => acc.flatMap(item => current.map(cItem => [...item, cItem])),
            head.map(item => [item])
        );
    };

    if (wordVariations.length === 0) return [];
    
    const combinations = cartesian(...wordVariations);
    const result = combinations.map(combo => combo.join(' '));
    return [...new Set(result)];
};

const parseLine = (line: string): { text: string; translation?: string } => {
    const separatorIndex = line.lastIndexOf('/');
    let text, translation;

    if (separatorIndex !== -1) {
        text = line.substring(0, separatorIndex).trim();
        translation = line.substring(separatorIndex + 1).trim() || undefined;
    } else {
        const match = line.match(posAbbreviationsRegex);
        
        if (match && typeof match.index === 'number') {
            const splitIndex = match.index;
            text = line.substring(0, splitIndex).trim();
            translation = line.substring(splitIndex).trim() || undefined;
        } else {
            text = line.trim();
            translation = undefined;
        }
    }

    // Handle inverted entries like "Afuw, El-" -> "El-Afuw"
    if (text.includes(',')) {
        const parts = text.split(',');
        if (parts.length === 2) {
            const firstPart = parts[0].trim();
            const secondPart = parts[1].trim();
            if (secondPart.endsWith('-')) {
                text = secondPart + firstPart;
            }
        }
    }

    return { text, translation };
};

const createEntriesFromRawText = (rawText: string, source: string): CorpusEntry[] => {
  const allEntries: CorpusEntry[] = [];
  const lines = rawText.split('\n').filter(line => line.trim() !== '');

  lines.forEach(line => {
    if (line.includes('//')) {
      const mainAndSubEntries = line.split('//');
      
      const mainEntryPart = mainAndSubEntries[0].trim();
      if (mainEntryPart) {
        const { text: rawText, translation } = parseLine(mainEntryPart);
        if (rawText) {
          const texts = processTextVariations(rawText);
          texts.forEach(text => {
            if (text) {
              allEntries.push({ id: String(++idCounter), text, translation, source });
            }
          });
        }
      }

      for (let i = 1; i < mainAndSubEntries.length; i++) {
        const subEntryBlock = mainAndSubEntries[i].trim();
        if (!subEntryBlock) continue;

        const subEntries = subEntryBlock.split(/[●•]/).filter(s => s.trim() !== '');
        subEntries.forEach(subEntry => {
          const subParts = subEntry.split('—');
          const rawText = subParts[0].trim();
          const translation = subParts.length > 1 ? subParts.slice(1).join('—').trim() : undefined;
          
          if (rawText) {
            const texts = processTextVariations(rawText);
            texts.forEach(text => {
              if(text) {
                allEntries.push({
                  id: String(++idCounter),
                  text: text,
                  translation,
                  source,
                });
              }
            });
          }
        });
      }
    } else {
      const { text: rawText, translation } = parseLine(line);
      if (rawText) {
        const texts = processTextVariations(rawText);
        texts.forEach(text => {
          if (text) {
            allEntries.push({ id: String(++idCounter), text, translation, source });
          }
        });
      }
    }
  });

  return allEntries;
};


const createEntriesFromString = (textBlock: string, source: string): CorpusEntry[] => {
  // Split by '#' at the beginning of a line, ignoring leading whitespace on the line.
  const entries = textBlock.trim().split(/^\s*#\s*/m).filter(s => s.trim() !== '');
  return entries.map(entry => {
    return {
      id: String(++idCounter),
      text: entry.trim(),
      translation: undefined,
      source,
    };
  });
};

const dictionaryData = createEntriesFromRawText(dictionaryRawText, 'Dictionary');
const mikayilData = createEntriesFromString(mikayilEmineskuwEntries, 'Mikayil Emineskúw');
const tanerData = createEntriesFromString(tanerMuratEntries, 'Taner Murat');
const schillerData = createEntriesFromString(friedrichSchillerEntries, 'Friedrich Schiller');
const baudelaireData = createEntriesFromString(charlesBaudelaireEntries, 'Charles Baudelaire');

export const corpus: CorpusEntry[] = [
  ...dictionaryData,
  ...mikayilData,
  ...tanerData,
  ...schillerData,
  ...baudelaireData,
];