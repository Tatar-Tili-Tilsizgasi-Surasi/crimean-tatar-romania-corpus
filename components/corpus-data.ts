import { CorpusEntry } from '../types';
import { dictionaryEntries } from '../data/dictionary';
import { mikayilEmineskuwEntries } from '../data/Mikayil_Emineskuw';
import { tanerMuratEntries } from '../data/Taner_Murat';
import { friedrichSchillerEntries } from '../data/Friedrich_Schiller';
import { charlesBaudelaireEntries } from '../data/Charles_Baudelaire';

let idCounter = 0;

const createEntries = (texts: string[], source: string): CorpusEntry[] => {
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

const dictionaryData = createEntries(dictionaryEntries, 'Dictionary');
const mikayilData = createEntries(mikayilEmineskuwEntries, 'Mikayil Emineskúw');
const tanerData = createEntries(tanerMuratEntries, 'Taner Murat');
const schillerData = createEntries(friedrichSchillerEntries, 'Friedrich Schiller');
const baudelaireData = createEntries(charlesBaudelaireEntries, 'Charles Baudelaire');

export const corpus: CorpusEntry[] = [
  ...dictionaryData,
  ...mikayilData,
  ...tanerData,
  ...schillerData,
  ...baudelaireData,
];