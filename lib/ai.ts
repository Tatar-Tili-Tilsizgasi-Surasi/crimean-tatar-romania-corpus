
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

// Use a single instance for efficiency
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextMatches: CorpusEntry[] = []
): Promise<string> {
    // Reduced slice from 50 to 15 to significantly improve latency
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 15);
    const contextString = distinctContext.join('\n');

    let specificTaskInstruction = '';
    if (sourceLang === 'Crimean Tatar (Standard)' && targetLang === 'Crimean Tatar (Romania)') {
        specificTaskInstruction = `
### DIALECT CONVERSION: Standard CT -> Romania CT
- Vowels: ö->ó, ü->ú, ı->î, i->í.
- Consonants: ç->ş, c->ğ, f->p, v->w.
- Replace 'büyük' with 'balaban', 'çoq' with 'kóp'.
- Use 'man/men' for 'with'.`;
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
        specificTaskInstruction = `### DIALECT CONVERSION: Romania CT -> Standard CT`;
    } else {
        specificTaskInstruction = `Translate from ${sourceLang} to ${targetLang}.`;
    }

    const systemInstruction = `You are an expert linguist for the Crimean Tatar language in Romania (Dobruja dialect).

RULES:
1. TOPOGRAPHY: Use proper nouns for countries/cities from context. If missing, adopt from Romanian. NEVER invent.
2. PURISM: Prefer traditional terms (ómírbílímí, felekiyat, riyaziyet, nebatat, iktisat, darúlfúnun, haywanatbílímí) over Romanian loans.
3. LOANS: If no traditional term exists, follow the Romanian adoption rules strictly (e.g., -logia -> -loğiya).
4. ORTHOGRAPHY: NO 'ö', 'ü', 'ı', 'c', 'â'. USE: 'ó', 'ú', 'î', 'í', 'ğ', 'ş', 'ñ'.
5. CORPUS: Use provided matches for vocabulary priority.

DATABASE:
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}
${CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO}
${foreignWordsAdoptionInfo}
${CRIMEAN_TATAR_RO_EXAMPLES}`;

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

        return response.text?.trim() || "Translation unavailable.";
    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Translation failed. Please try again.";
    }
}
