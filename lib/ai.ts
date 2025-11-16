


import { GoogleGenAI } from "@google/genai";
import { CorpusEntry } from '../types';
import {
    CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO,
    CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO,
    CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO,
    CRIMEAN_TATAR_RO_EXAMPLES
} from '../data/promptData';
import { foreignWordsAdoptionInfo } from '../data/foreign_words_adoption';
import { Words as specialWords } from '../data/data_for_translator';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextMatches: CorpusEntry[] = []
): Promise<string> {
    // 1. Construct Context Matching String from relevant corpus entries
    // We vastly increase the context limit to 500 entries to provide rich dialect flavor.
    const distinctContext = Array.from(new Set(contextMatches.map(e => `${e.text} <=> ${e.translation}`))).slice(0, 500);
    const contextString = distinctContext.join('\n');

    // 2. Define specific task instructions based on the language pair
    let specificTaskInstruction = '';
    
    if (targetLang === 'Crimean Tatar (Romania)') {
        specificTaskInstruction = `
### TASK: TRANSLATION TO CRIMEAN TATAR (ROMANIA DIALECT)
Translate the input text strictly into the Romania (Dobruja) dialect.
**MANDATORY CONSTRAINTS:**
1.  **ORTHOGRAPHY:** You MUST use ONLY the allowed dialect alphabet. FORBIDDEN: 'ö', 'ü', 'ı', 'c', 'ç', 'â'. USE SUBSTITUTES: 'ó', 'ú', 'î'/'í', 'ğ', 'ş'.
2.  **VOCABULARY:** Matches from the CORPUS GLOSSARY below are ABSOLUTE OVERRIDES. Use them exactly as they appear. Also prefer words from the APPROVED LOANWORD VOCABULARY.
3.  **GRAMMAR:** Use 'man'/'men' for 'with'. NEVER use '-nen'/'-len'.
`;
        if (sourceLang === 'Crimean Tatar (Standard)') {
             specificTaskInstruction += `\n**DIALECT CONVERSION:** Aggressively apply shifts: ç->ş, c->ğ, v->w, initial y->ğ.`;
        }
    } else if (sourceLang === 'Crimean Tatar (Romania)' && targetLang === 'Crimean Tatar (Standard)') {
         specificTaskInstruction = `
### TASK: DIALECT CONVERSION (Romania CT -> Standard CT)
Convert the Romania (Dobruja) dialect input back to Standard Crimean Tatar.
- Reverse the shifts: ş -> ç, ğ -> c, ó -> ö, ú -> ü, 'man'/'men' -> '-nen'/'-len'.
- Replace dialectisms (e.g., 'balaban') with standard terms (e.g., 'büyük').
`;
    } else {
        specificTaskInstruction = `
### TASK: GENERAL TRANSLATION
Translate from ${sourceLang} to ${targetLang}.
If the input is Crimean Tatar (Romania), interpret its unique orthography (e.g., 'ş' = standard 'ç', 'ğ' = standard 'c') correctly before translating.
`;
    }

    // 3. Build the full system prompt
    const systemInstruction = `You are an expert linguist specializing in the **Crimean Tatar language, specifically the Romania (Dobruja) dialect**.
Your goal is to produce translations that are authentically Dobrujan, strictly adhering to its unique orthography and lexicon, rejecting standard Istanbul Turkish or Standard Crimean Tatar forms where they differ.

### KNOWLEDGE BASE (Dobruja Dialect RULES - STRICT ADHERENCE):
${CRIMEAN_TATAR_RO_ORTHOGRAPHY_INFO}
${CRIMEAN_TATAR_RO_SCT_DT_SUMMARY_INFO}
${CRIMEAN_TATAR_RO_VOWEL_HARMONY_INFO}

### LOANWORD POLICY (for terms not in corpus):
- If a word for a concept does not exist in the Dobrujan Tatar corpus, you MUST derive it from its **Romanian** equivalent.
- DO NOT invent new words (neologisms) by combining Tatar words (e.g., do not translate "dinosaur" as "korkînş kertenkele").
- DO NOT use loanwords from Russian, Ukrainian, or modern Standard Turkish unless they are already established in the corpus.
- Adapt the Romanian loanword to Dobrujan Tatar phonology and orthography using the rules specified in "The Adoption of foreign words" section.
- **Examples:**
  - "enciclopedie" (Romanian) -> "ençiklopediya"
  - "dinozaur" (Romanian) -> "dinozawîr"
  - "Spania" (Romanian) -> "Spaniye"

${foreignWordsAdoptionInfo}

### APPROVED LOANWORD VOCABULARY:
Use these spellings for modern terms: ${specialWords}

### REFERENCE EXAMPLES:
${CRIMEAN_TATAR_RO_EXAMPLES}
`;

    const userPrompt = `
${specificTaskInstruction}

**INPUT TEXT (${sourceLang}):**
"${text}"

**CORPUS GLOSSARY (ABSOLUTE PRIORITY OVER INTERNAL KNOWLEDGE):**
(Use these exact terms if applicable to the input)
---
${contextString || '(No direct corpus matches found. Rely strictly on dialect rules above.)'}
---

**OUTPUT (${targetLang}):**
(Provide ONLY the translated text, no explanations)
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1, // Very low temperature for strict rule adherence
            },
            contents: userPrompt,
        });

        return response.text?.trim() || "Translation could not be generated.";

    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Error: Translation service is temporarily unavailable. Please try again later.";
    }
}
