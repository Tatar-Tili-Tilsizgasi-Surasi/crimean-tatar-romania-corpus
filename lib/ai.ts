
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
    // We vastly increase the context limit to 500 entries. Gemini 1.5 Flash has a large context window (1M tokens),
    // so we can afford to be very generous with examples to ensure dialect adherence.
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 500);
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
- **Lexicon:** Use authentic Dobrujan words (e.g., 'balaban' for 'büyük', 'kóp' for 'çoq') found in the CORPUS GLOSSARY below.
`;
        } else {
            specificTaskInstruction = `
### TASK: TRANSLATION TO CRIMEAN TATAR (ROMANIA)
Translate the input text into natural-sounding Crimean Tatar as spoken in Romania (Dobruja).
- **CRITICAL:** You MUST use the vocabulary provided in the CORPUS GLOSSARY below if a word matches. This is the authoritative source.
- ADHERE STRICTLY to the Dobruja orthography (NO 'ö', 'ü', 'ı', 'c', 'ç').
`;
        }
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
         specificTaskInstruction = `
### TASK: DIALECT CONVERSION (Romania CT -> Standard CT)
Convert the input from Romania (Dobruja) dialect back to Standard Crimean Tatar.
- Reverse the common shifts: ş -> ç, ğ -> c, ó -> ö, ú -> ü, 'man'/'men' -> '-nen'/'-len' where appropriate for Standard CT.
- Use standard Turkish-influenced vocabulary where the Dobruja dialect uses archaic/Nogay terms.
`;
    } else {
        specificTaskInstruction = `
### TASK: GENERAL TRANSLATION
Translate from ${sourceLang} to ${targetLang}.
If translating FROM Crimean Tatar (Romania), interpret its unique orthography correctly based on the CORPUS GLOSSARY (e.g., 'ş' often corresponds to standard 'ç').
`;
    }

    // 3. Build the full system prompt
    const systemInstruction = `You are an expert linguist and translator specializing in the **Crimean Tatar language, specifically the Romania (Dobruja) dialect**.

### CORE DIRECTIVE: CORPUS PRIORITY
You are provided with a "CORPUS GLOSSARY" of relevant terms found in the established database. 
**YOU MUST USE THESE TRANSLATIONS** if the terms appear in the input. They represent the *only* correct translation for this specific dialect context, overriding general Crimean Tatar or Turkish knowledge.

### KNOWLEDGE BASE (Dobruja Dialect Rules):
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}

### STYLE & TONE:
- Maintain the authentic "flavor" of the Dobruja dialect (Kipchak/Nogay influence).
- Avoid modern Istanbul Turkish loanwords if an authentic Tatar equivalent exists in the glossary or your knowledge base.

### REFERENCE EXAMPLES:
${CRIMEAN_TATAR_RO_EXAMPLES}
`;

    const userPrompt = `
${specificTaskInstruction}

**INPUT TEXT (${sourceLang}):**
"${text}"

**CORPUS GLOSSARY (MANDATORY USE):**
(The following entries are from the official corpus. Use them exactly as shown for their respective terms.)
---
${contextString || '(No direct corpus matches found for this input specific words. Rely on general dialect rules.)'}
---

**OUTPUT (${targetLang}):**
(Provide ONLY the translated text, no explanations)
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // Lower temperature even further for stricter adherence to glossary
            },
            contents: userPrompt,
        });

        return response.text?.trim() || "Translation could not be generated.";

    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Error: Translation service is temporarily unavailable. Please try again later.";
    }
}
