import { GoogleGenAI } from '@google/genai';
import { corpus } from '../components/corpus-data';
import { CorpusEntry } from '../types';
import {
  CRIMEAN_TATAR_RO_ALPHABET_PRONUNCIATION_GUIDE,
  CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
  CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
  CRIMEAN_TATAR_RO_EXAMPLES,
  CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
  CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO,
  CRIMEAN_TATAR_RO_SYLLABLE_STRUCTURE_INFO,
  CRIMEAN_TATAR_RO_BIRD_NAMES_TABLE,
  CRIMEAN_TATAR_RO_COMPREHENSIVE_GRAMMAR_DETAILS,
} from '../data/promptData';

const formatCorpusForPrompt = (corpusData: CorpusEntry[]): string => {
  return corpusData
    .map(entry => {
      let text = `# ${entry.text}`;
      if (entry.translation) {
        text += ` — ${entry.translation}`;
      }
      return text;
    })
    .join('\n');
};

const corpusExamples = formatCorpusForPrompt(corpus);

const SYSTEM_INSTRUCTION = `
You are an expert translator specializing in the Crimean Tatar (Romania) dialect. Your primary goal is to provide accurate, natural, and contextually appropriate translations.

When translating to or from "Crimean Tatar (Romania)", you MUST adhere strictly to the following linguistic rules, orthography, and examples. This is not standard Crimean Tatar; it is the specific Dobrujan dialect. Do not confuse it with other Turkic languages or dialects.

You must only output the translated text. Do not add any commentary, explanations, or labels like "Translation:".

--- LINGUISTIC CONTEXT & RULES FOR CRIMEAN TATAR (ROMANIA) ---

${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_ALPHABET_PRONUNCIATION_GUIDE}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}
${CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO}
${CRIMEAN_TATAR_RO_SYLLABLE_STRUCTURE_INFO}
${CRIMEAN_TATAR_RO_COMPREHENSIVE_GRAMMAR_DETAILS}
${CRIMEAN_TATAR_RO_BIRD_NAMES_TABLE}
${CRIMEAN_TATAR_RO_EXAMPLES}

--- START OF FULL CORPUS EXAMPLES ---
${corpusExamples}
--- END OF FULL CORPUS EXAMPLES ---

--- END OF LINGUISTIC CONTEXT & RULES ---
`;

let ai: GoogleGenAI | null = null;

const getGenAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }
  return ai;
};

export const translateText = async (
  inputText: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  const genAIClient = getGenAIClient();
  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}:\n\n"${inputText}"`;

  const response = await genAIClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text.trim();
};
