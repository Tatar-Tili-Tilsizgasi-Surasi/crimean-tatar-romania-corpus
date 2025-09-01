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
        const { text, translation } = parseLine(mainEntryPart);
        if (text) {
          allEntries.push({ id: String(++idCounter), text, translation, source });
        }
      }

      for (let i = 1; i < mainAndSubEntries.length; i++) {
        const subEntryBlock = mainAndSubEntries[i].trim();
        if (!subEntryBlock) continue;

        const subEntries = subEntryBlock.split(/[●•]/).filter(s => s.trim() !== '');
        subEntries.forEach(subEntry => {
          const subParts = subEntry.split('—');
          const text = subParts[0].trim();
          const translation = subParts.length > 1 ? subParts.slice(1).join('—').trim() : undefined;
          
          if (text) {
            allEntries.push({
              id: String(++idCounter),
              text: text,
              translation,
              source,
            });
          }
        });
      }
    } else {
      const { text, translation } = parseLine(line);
      if (text) {
        allEntries.push({ id: String(++idCounter), text, translation, source });
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
