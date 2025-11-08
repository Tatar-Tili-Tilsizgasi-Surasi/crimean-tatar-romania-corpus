
import { GoogleGenAI } from "@google/genai";
import { CorpusEntry } from '../types';
import { grammarRules } from '../promptData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAITranslation(
    text: string, 
    contextEntries: CorpusEntry[], 
    targetLang: 'toCT' | 'fromCT' | 'auto'
): Promise<string> {
    const contextString = contextEntries.map(e => `- ${e.text} <=> ${e.translation}`).join('\n');
    
    let targetLangName = 'Crimean Tatar (Romania) or English/Romanian depending on input';
    if (targetLang === 'toCT') targetLangName = 'Crimean Tatar (Romania)';
    if (targetLang === 'fromCT') targetLangName = 'English or Romanian';

    const systemInstruction = `You are an expert translator for the Crimean Tatar language, specifically the dialect spoken in Romania.
It is a unique dialect influenced by Nogay, Ottoman Turkish, and Romanian.

STRICT ALPHABET & GRAMMAR RULES:
${grammarRules}

CRITICAL INSTRUCTIONS:
1. **LOOKUP FIRST:** Use the provided 'Corpus Matches' below as your PRIMARY source of truth for vocabulary and spelling. If a word exists in the matches, YOU MUST use that exact spelling.
2. **STRICT ALPHABET:** When translating TO Crimean Tatar (Romania), YOU MUST ONLY use letters from the OFFICIAL ALPHABET listed in the grammar rules. Do NOT use standard Turkish/Crimean letters like 'ı', 'ö', 'ü' if they are not in the allowed list; convert them to their Romanian dialect equivalents ('î'/'í', 'ó', 'ú') as per the alphabet rules.
3. output ONLY the final translated text. Do not add explanations.`;

    const prompt = `Text to translate:\n"${text}"\n\nCorpus Matches (Vocabulary Context):\n${contextString || 'None'}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, 
            },
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("AI Translation Error:", error);
        return "Error: translation failed. Please check your connection and try again.";
    }
}