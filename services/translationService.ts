import * as genAI from '@google/genai';
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

export const translateText = async (
  inputText: string,
  sourceLangName: string,
  targetLangName: string
): Promise<string> => {
  try {
    // The CDN build for @google/genai seems to be a CJS module wrapped as an ES module.
    // This requires accessing the constructor via the `default` property on the namespace import.
    const GoogleGenAI = (genAI as any).default.GoogleGenAI;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}:\n\n"${inputText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Translation service error:", error);
    throw new Error("Failed to translate text.");
  }
};
