
import { CorpusEntry } from '../types';
import { dictionaryRawText } from '../data/dictionary';
import { mikayilEmineskuwEntries } from '../data/Mikayil_Emineskuw';
import { friedrichSchillerEntries } from '../data/Friedrich_Schiller';
import { charlesBaudelaireEntries } from '../data/Charles_Baudelaire';
import { fiatJustitiaEntries } from '../data/Taner_Murat/Fiat_Justitia';
import { otkenBirSaklaygaSewdamEntries } from '../data/Taner_Murat/Otken_bir_saklayga_sewdam';
import { websiteEntries } from '../data/Taner_Murat/Website';
import { peruzeliSalingakEntries } from '../data/Taner_Murat/Peruzeli_salingak';
import { theSoundsOfTatarSpokenInRomaniaEntries } from '../data/Taner_Murat/The_Sounds_of_Tatar_Spoken_in_Romania';
import { botDictionaryRawText } from '../data/bot_dictionary';
import { ornDictionaryRawText } from '../data/orn_dictionary';
import { misDictionaryRawText } from '../data/mis_dictionary';
import { ademMiskiyebicEntries } from '../data/Adem_Miskiyebic';
import { uteKarsunEntries } from '../data/Ute_Karsun';
import { geriyBekEntries } from '../data/Geriy_Bek';
import { kovid19Entries } from '../data/Ram_Krishna_Singh/Kovid-19_hem_sessizlik_tolkini';
import { menIsaTuwulmanEntries } from '../data/Ram_Krishna_Singh/Men_Isa_tuwulman';
import { abdullahTukayEntries } from '../data/Abdullah_Tukay';
import { abdulhalikUygurEntries } from '../data/Abdulhalik_Uygur';
import { arthurRimbaudEntries } from '../data/Arthur_Rimbaud';
import { paulVerlaineEntries } from '../data/Paul_Verlaine';
import { osak2011Entries } from '../data/Nazar_Look/Osak_2011';
import { subat2011Entries } from '../data/Nazar_Look/Subat_2011';

let idCounter = 0;

// List of part-of-speech abbreviations used to detect translations when '/' is missing.
const posAbbreviations = [
    's\\.', 'adj\\.', 'adv\\.', 'pron\\.', 'v\\.', 'interj\\.', 'prep\\.', 'conj\\.', 'num\\.', 'art\\.',
    '\\(fiziol\\.\\)', '\\(muz\\.\\)', '\\(electr\\.\\)', '\\(antrop\\. f\\.\\)', '\\(fiz\\.\\)',
    // Roman numerals (ordered from longest to shortest to prevent partial matches)
    'X\\.', 'IX\\.', 'VIII\\.', 'VII\\.', 'VI\\.', 'V\\.', 'IV\\.', 'III\\.', 'II\\.', 'I\\.',
    // Alphabetical list markers
    'A\\.', 'B\\.', 'C\\.', 'D\\.', 'E\\.', 'F\\.', 'G\\.', 'H\\.'
];
const posAbbreviationsRegex = new RegExp(`\\s+(${posAbbreviations.join('|')})`);

const createEntriesFromLatinGroupedText = (rawText: string, source: string): CorpusEntry[] => {
  const processedRawText = rawText.replace(/ș/g, 'ş').replace(/Ș/g, 'Ş');
  const allEntries: CorpusEntry[] = [];
  const lines = processedRawText.trim().split('\n');
  
  let currentLatinNameParts: string[] = [];
  let currentTerms: string[] = [];

  const processCurrentBlock = () => {
    if (currentLatinNameParts.length > 0 && currentTerms.length > 0) {
      // Each part is a "word" that might have spaces inside. Join them.
      const translation = currentLatinNameParts.join(' ');
      
      currentTerms.forEach(term => {
        allEntries.push({
          id: String(++idCounter),
          text: term,
          translation,
          source,
        });
      });
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('•')) {
      const term = trimmedLine.substring(1).trim();
      if (term) {
        currentTerms.push(term);
      }
    } else {
      // This line is part of a Latin name.
      // If we have terms, it means a new Latin name is starting, so the previous block is complete.
      if (currentTerms.length > 0) {
        processCurrentBlock();
        currentLatinNameParts = [];
        currentTerms = [];
      }
      currentLatinNameParts.push(trimmedLine);
    }
  }
  
  // Process the last block in the file
  processCurrentBlock();

  return allEntries;
};

const processTextVariations = (rawText: string): string[] => {
    const trimmedText = rawText.trim();
    if (!trimmedText) return [];
    const wordList = trimmedText.split(/\s+/);

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
        
        // Filter out empty or whitespace-only strings that might result from patterns like "word/" or "word()".
        return [...new Set(finalVariations)].filter(v => v.trim());
    };

    const wordVariations = wordList.map(processWordVariations);

    // Group consecutive words that have alternatives (from slashes or parentheses).
    // This handles cases like "tañ/saba/ şafak atmak" correctly by treating
    // "tañ/saba/ şafak" as a single set of choices.
    const groupedVariations: string[][] = [];
    let currentGroup: string[] = [];

    for (const variations of wordVariations) {
        if (variations.length > 1) { // This word part had alternatives
            currentGroup.push(...variations);
        } else { // This word part had no alternatives
            if (currentGroup.length > 0) {
                groupedVariations.push([...new Set(currentGroup)]);
                currentGroup = [];
            }
            if (variations.length > 0) { // Only push if there is content
                groupedVariations.push(variations);
            }
        }
    }
    if (currentGroup.length > 0) {
        groupedVariations.push([...new Set(currentGroup)]);
    }

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

    if (groupedVariations.length === 0) return [];
    
    const combinations = cartesian(...groupedVariations);
    const result = combinations.map(combo => combo.join(' '));
    return [...new Set(result)];
};

const parseLine = (line: string): { text: string; translation?: string } => {
    let text: string;
    let translation: string | undefined;

    // Use ' / ' as a more reliable separator for translations.
    const separator = ' / ';
    const separatorIndex = line.indexOf(separator);

    if (separatorIndex !== -1) {
        text = line.substring(0, separatorIndex).trim();
        translation = line.substring(separatorIndex + separator.length).trim() || undefined;
    } else {
        // Fallback for lines without ' / ', might be translation-less or use POS abbreviations.
        const match = line.match(posAbbreviationsRegex);
        if (match && typeof match.index === 'number') {
            const splitIndex = match.index;
            text = line.substring(0, splitIndex).trim();
            translation = line.substring(splitIndex).trim() || undefined;
        } else {
            text = line.trim();
            translation = undefined;

            // Handle entries with an empty translation marked by a final slash.
            // This is for cases that didn't match ' / ' (e.g., no space before slash).
            if (text.endsWith(' /')) {
                text = text.substring(0, text.length - 2).trim();
            } else if (text.endsWith('/')) {
                text = text.substring(0, text.length - 1).trim();
            }
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
  const processedRawText = rawText.replace(/ș/g, 'ş').replace(/Ș/g, 'Ş');
  const allEntries: CorpusEntry[] = [];
  const lines = processedRawText.split('\n').filter(line => line.trim() !== '');

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
  const processedTextBlock = textBlock.replace(/ș/g, 'ş').replace(/Ș/g, 'Ş');
  // Split by '#' at the beginning of a line, ignoring leading whitespace on the line.
  const entries = processedTextBlock.trim().split(/^\s*#\s*/m).filter(s => s.trim() !== '');
  return entries.map(entry => {
    const trimmedEntry = entry.trim();
    const parts = trimmedEntry.split('—');
    const text = parts[0].trim();
    const translation = parts.length > 1 ? parts.slice(1).join('—').trim() : undefined;

    return {
      id: String(++idCounter),
      text,
      translation,
      source,
    };
  });
};

const dictionaryData = createEntriesFromRawText(dictionaryRawText, 'Dictionary (Taner Murat)');
const mikayilData = createEntriesFromString(mikayilEmineskuwEntries, 'Mikayil Emineskúw');
const schillerData = createEntriesFromString(friedrichSchillerEntries, 'Friedrich Schiller');
const baudelaireData = createEntriesFromString(charlesBaudelaireEntries, 'Charles Baudelaire');
const tanerFiatJustitiaData = createEntriesFromString(fiatJustitiaEntries, 'Taner Murat - Fiat Justitia');
const tanerOtkenData = createEntriesFromString(otkenBirSaklaygaSewdamEntries, 'Taner Murat - Ótken bír şaklayga sewdam');
const tanerWebsiteData = createEntriesFromString(websiteEntries, 'Taner Murat - Website');
const tanerPeruzeliData = createEntriesFromString(peruzeliSalingakEntries, 'Taner Murat - Perúzelí salînğak');
const tanerSoundsData = createEntriesFromString(theSoundsOfTatarSpokenInRomaniaEntries, 'Taner Murat - The Sounds of Tatar Spoken in Romania');
const botDictionaryData = createEntriesFromLatinGroupedText(botDictionaryRawText, 'Botanical Dictionary (Taner Murat)');
const ornDictionaryData = createEntriesFromLatinGroupedText(ornDictionaryRawText, 'Ornithological Dictionary (Taner Murat)');
const misDictionaryData = createEntriesFromRawText(misDictionaryRawText, 'Dictionary (Missing terms added by the community)');
const ademMiskiyebicData = createEntriesFromString(ademMiskiyebicEntries, 'Adem Miskiyebiç');
const uteKarsunData = createEntriesFromString(uteKarsunEntries, 'Úte Karsun');
const geriyBekData = createEntriesFromString(geriyBekEntries, 'Geriy Bek');
const kovid19Data = createEntriesFromString(kovid19Entries, 'Ram Krishna Singh - Kovid-19 hem sessízlík tolkînî');
const menIsaTuwulmanData = createEntriesFromString(menIsaTuwulmanEntries, 'Ram Krishna Singh - Men Isa tuwulman');
const abdullahTukayData = createEntriesFromString(abdullahTukayEntries, 'Abdullah Tukay');
const abdulhalikUygurData = createEntriesFromString(abdulhalikUygurEntries, 'Abdulhalik Uygur');
const arthurRimbaudData = createEntriesFromString(arthurRimbaudEntries, 'Arthur Rimbaud');
const paulVerlaineData = createEntriesFromString(paulVerlaineEntries, 'Paul Verlaine');
const osak2011Data = createEntriesFromString(osak2011Entries, 'Nazar Look, Oşak 2011, Sayî 1');
const subat2011Data = createEntriesFromString(subat2011Entries, 'Nazar Look, Şubat 2011, Sayî 2');


export const corpus: CorpusEntry[] = [
  ...dictionaryData,
  ...botDictionaryData,
  ...ornDictionaryData,
  ...misDictionaryData,
  ...mikayilData,
  ...tanerFiatJustitiaData,
  ...tanerOtkenData,
  ...tanerPeruzeliData,
  ...tanerWebsiteData,
  ...tanerSoundsData,
  ...osak2011Data,
  ...subat2011Data,
  ...schillerData,
  ...baudelaireData,
  ...ademMiskiyebicData,
  ...uteKarsunData,
  ...geriyBekData,
  ...kovid19Data,
  ...menIsaTuwulmanData,
  ...abdullahTukayData,
  ...abdulhalikUygurData,
  ...arthurRimbaudData,
  ...paulVerlaineData,
];
