
import { GoogleGenAI } from "@google/genai";
import { CorpusEntry } from '../types';
import {
    CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
    CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
    CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
    CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO,
    CRIMEAN_TATAR_RO_EXAMPLES
} from '../data/promptData';
import { foreignWordsAdoptionInfo } from '../data/foreign_words_adoption';
import { Words as translationTerminology } from '../data/data_for_translator';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextMatches: CorpusEntry[] = []
): Promise<string> {
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 35);
    const contextString = distinctContext.join('\n');

    let specificTaskInstruction = '';
    if (sourceLang === 'Crimean Tatar (Standard)' && targetLang === 'Crimean Tatar (Romania)') {
        specificTaskInstruction = `
### DIALECT CONVERSION: Standard CT -> Romania CT
- ö -> ó, ü -> ú, ı -> î/í.
- ç -> ş, c -> ğ.
- 'büyük' -> 'balaban', 'çoq' -> 'kóp'.
- Use 'man/men' for 'with'.
`;
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
        specificTaskInstruction = `### DIALECT CONVERSION: Romania CT -> Standard CT.`;
    } else {
        specificTaskInstruction = `Translate from ${sourceLang} to ${targetLang}.`;
    }

    const systemInstruction = `You are a world-class senior linguist specializing in the Crimean Tatar language of Romania (Dobruja dialect).

### CRITICAL RULES:
1. **LEXICAL PRIORITY:** 
   - 1st: Use the exact matches provided in "Corpus Context".
   - 2nd: Use traditional (Persian/Arabic/Turkic) terms from reference lists.
   - 3rd: Use established modern loanwords found in "Linguistic Data".
   
2. **TOPOGRAPHY:** Use proper nouns for countries/cities from context. If missing, adopt from Romanian strictly (e.g., 'Spaniye', 'Norveğiye').

3. **ORTHOGRAPHY:**
   - NO: 'ö', 'ü', 'ı', 'c', 'â', 'ç'.
   - USE: 'ó', 'ú', 'î', 'í', 'ğ', 'ş', 'ñ'.

### LINGUISTIC DATA:
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}
${CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO}

### ESTABLISHED TERMINOLOGY:
${translationTerminology}

### FOREIGN WORD ADOPTION:
${foreignWordsAdoptionInfo}

### REFERENCE EXAMPLES:
${CRIMEAN_TATAR_RO_EXAMPLES}
`;

    const userPrompt = `
${specificTaskInstruction}
Input (${sourceLang}): "${text}"
Context:
${contextString || 'None.'}
Output only the ${targetLang} translation:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1,
            },
        });

        return response.text?.trim() || "Translation failed.";
    } catch (error) {
        console.error("AI Translation Error:", error);
        return "An error occurred during translation.";
    }
}
