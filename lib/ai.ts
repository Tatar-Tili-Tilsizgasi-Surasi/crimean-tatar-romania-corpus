
import { GoogleGenAI } from "@google/genai";
import { CorpusEntry } from '../types';
import {
    CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
    CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
    CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
    CRIMEAN_TATAR_RO_EXAMPLES
} from '../data/promptData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextMatches: CorpusEntry[] = []
): Promise<string> {
    // 1. Construct Context Matching String from relevant corpus entries
    // Limit matches to avoid overflowing context window, though Gemini has a large one.
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 60);
    const contextString = distinctContext.join('\n');

    // 2. Define specific task instructions based on the language pair
    let specificTaskInstruction = '';
    
    if (targetLang === 'Crimean Tatar (Romania)') {
        if (sourceLang === 'Crimean Tatar (Standard)') {
             specificTaskInstruction = `
### TASK: DIALECT CONVERSION (Standard CT -> Romania CT)
Convert the input from Standard Crimean Tatar to the Romania (Dobruja) dialect.
YOU MUST APPLY THESE SHIFTS RIGOROUSLY:
- **Orthography:** c -> ğ, ç -> ş, ö -> ó, ü -> ú, ı -> î/í.
- **Grammar:** Change comitative '-nen'/'-len' to separate postposition 'man'/'men'.
- **Lexicon:** Use authentic Dobrujan words (e.g., 'balaban' for 'büyük', 'kóp' for 'çoq').
`;
        } else {
            specificTaskInstruction = `
### TASK: TRANSLATION TO CRIMEAN TATAR (ROMANIA)
Translate the input text into natural-sounding Crimean Tatar as spoken in Romania.
- ADHERE STRICTLY to the Dobruja orthography (NO 'ö', 'ü', 'ı', 'c').
- Use the provided CORPUS MATCHES as the authoritative source for vocabulary.
`;
        }
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
         specificTaskInstruction = `
### TASK: DIALECT CONVERSION (Romania CT -> Standard CT)
Convert the input from Romania (Dobruja) dialect back to Standard Crimean Tatar.
- Reverse the common shifts: ş -> ç, ğ -> c, ó -> ö, ú -> ü, 'man'/'men' -> '-nen'/'-len' where appropriate for Standard CT.
`;
    } else {
        specificTaskInstruction = `
### TASK: GENERAL TRANSLATION
Translate from ${sourceLang} to ${targetLang}.
If translating FROM Crimean Tatar (Romania), ensure you correctly interpret its unique orthography (e.g., 'ş' might correspond to standard 'ç', 'ğ' to 'c').
`;
    }

    // 3. Build the full system prompt
    const systemInstruction = `You are an expert linguist and translator specializing in the **Crimean Tatar language, specifically the Romania (Dobruja) dialect**.

### CORE KNOWLEDGE BASE (STRICT ADHERENCE REQUIRED for Romania Dialect):
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}

### STYLE & TONE:
- Maintain the authentic "flavor" of the Dobruja dialect. It often prefers older Kipchak/Nogay forms over modern Oghuz (Turkish) influences found in Standard CT.
- When unsure of a specific Dobrujan term, prefer a slightly archaic Turkic term over a modern Turkish loanword, unless it's a well-established modern concept.

### REFERENCE EXAMPLES:
${CRIMEAN_TATAR_RO_EXAMPLES}
`;

    const userPrompt = `
${specificTaskInstruction}

**INPUT TEXT (${sourceLang}):**
"${text}"

**CORPUS MATCHES (HIGH PRIORITY VOCABULARY):**
(Use these exact translations if applicable to the input)
${contextString || 'No direct corpus matches available.'}

**OUTPUT (${targetLang}):**
(Provide ONLY the translated text, no explanations)
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, // Lower temperature for higher adherence to rules and vocabulary
            },
            contents: userPrompt,
        });

        return response.text?.trim() || "Translation could not be generated.";

    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Error: Translation service is temporarily unavailable. Please try again later.";
    }
}
