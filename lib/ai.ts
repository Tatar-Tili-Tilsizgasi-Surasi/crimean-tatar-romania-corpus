
import { GoogleGenAI } from "@google/genai";
import { CorpusEntry } from '../types';
import {
    CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
    CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
    CRIMEAN_TATAR_RO_TERMINOLOGY_PREFERENCE,
    CRIMEAN_TATAR_RO_FOREIGN_ADOPTION_RULES,
    CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
    CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO,
    CRIMEAN_TATAR_RO_EXAMPLES
} from '../data/promptData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextMatches: CorpusEntry[] = []
): Promise<string> {
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 50);
    const contextString = distinctContext.join('\n');

    let specificTaskInstruction = '';
    if (sourceLang === 'Crimean Tatar (Standard)' && targetLang === 'Crimean Tatar (Romania)') {
        specificTaskInstruction = `
### SPECIAL TASK: DIALECT CONVERSION (Standard CT -> Romania CT)
You are converting Standard Crimean Tatar to the Romania (Dobruja) dialect.
STRICTLY APPLY these shifts:
- **Vowels:** ö -> ó, ü -> ú, ı -> î (or í depending on harmony), i -> í (often reduced).
- **Consonants:** ç -> ş (MANDATORY), c -> ğ (MANDATORY), f -> p (authentic words), v -> w (authentic words).
- **Lexicon:** Replace Standard CT words with Dobrujan equivalents where they differ (e.g., use 'balaban' instead of 'büyük', 'kóp' instead of 'çoq').
- **Grammar:** Use 'man/men' for 'with' instead of '-nen/-len'.
`;
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
        specificTaskInstruction = `
### SPECIAL TASK: DIALECT CONVERSION (Romania CT -> Standard CT)
You are converting the Romania (Dobruja) dialect back to Standard Crimean Tatar.
Reverse the common dialect shifts to standard orthography (e.g., ş -> ç where appropriate, ğ -> c, ó -> ö, ú -> ü).
`;
    } else {
        specificTaskInstruction = `Translate from ${sourceLang} to ${targetLang}. Ensure the ${targetLang === 'Crimean Tatar (Romania)' ? 'Crimean Tatar (Romania)' : sourceLang} adheres strictly to its specific orthography and vocabulary rules.`;
    }

    const systemInstruction = `You are an expert linguist specializing in the **Crimean Tatar language as spoken in Romania (Dobruja dialect)**.

### CRITICAL INSTRUCTIONS:
1. **CORPUS AND DATA PRIORITY:** The "Corpus Matches" and provided terminology lists are your ABSOLUTE primary source.
2. **TOPOGRAPHY:** Use existing proper nouns for countries, cities, and regions. NEVER invent new words for topography. If a translation is missing, ADOPT it from Romanian using the provided rules.
3. **TERMINOLOGY PREFERENCE:** Use traditional (Persian/Arabic/Turkic) terms (e.g., ómírbílímí, felekiyat) over modern Romanian/European loans whenever they exist.
4. **LOAN ADOPTION:** If no traditional term or topography match exists, follow the Romanian loan adoption rules (e.g., -logia -> -loğiya).
5. **STRICT ORTHOGRAPHY:**
   - NO 'ö', 'ü', 'ı', 'c', 'â'.
   - USE ONLY: 'ó', 'ú', 'î', 'í', 'ğ', 'ş', 'ñ'.

---
### LINGUISTIC DATABASE
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_TERMINOLOGY_PREFERENCE}
${CRIMEAN_TATAR_RO_FOREIGN_ADOPTION_RULES}
${CRIMEAN_TATAR_RO_PHONETIC_CHANGES_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}

### REFERENCE EXAMPLES
${CRIMEAN_TATAR_RO_EXAMPLES}
---
`;

    const userPrompt = `
${specificTaskInstruction}

Input Text (${sourceLang}):
"${text}"

Corpus Matches (Vocabulary Context - HIGH PRIORITY):
${contextString || 'No direct corpus matches.'}

Output only the translation in ${targetLang}:
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1,
            },
            contents: userPrompt,
        });

        return response.text?.trim() || "";

    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Translation failed. Please check your connection and try again.";
    }
}
