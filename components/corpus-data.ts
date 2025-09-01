import { CorpusEntry } from '../types';
import { dictionaryEntries } from '../data/dictionary';
import { mikayilEmineskuwEntries } from '../data/Mikayil_Emineskuw';
import { tanerMuratEntries } from '../data/Taner_Murat';
import { friedrichSchillerEntries } from '../data/Friedrich_Schiller';
import { charlesBaudelaireEntries } from '../data/Charles_Baudelaire';

let idCounter = 0;

const createEntriesFromArray = (texts: string[], source: string): CorpusEntry[] => {
  return texts.map(line => {
    const parts = line.split('\t');
    const text = parts[0];
    const translation = parts.length > 1 ? parts[1] : undefined;
    return {
      id: String(++idCounter),
      text,
      translation,
      source,
    };
  });
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

const dictionaryData = createEntriesFromArray(dictionaryEntries, 'Dictionary');
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
