// js/api.js

// Inizializzazione Client Supabase
export const sbClient = supabase.createClient(
    "https://dtgitfiutlmymlgysovj.supabase.co", 
    "sb_publishable_w688bWi3FPCUDEPHumsqPA_QAils40A"
);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function callGeminiProxy(prompt) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Proxy Gemini error ${response.status}: ${errorDetails}`);
    }

    return response.json();
}

export async function fetchAIWithRetry(prompt, attempt = 1) {
    try {
        const data = await callGeminiProxy(prompt);
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!rawText) {
            throw new Error('Risposta Gemini non valida');
        }

        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/```json|```/g, '').trim();
        }

        return JSON.parse(rawText);
    } catch (err) {
        if (attempt < 3) {
            await sleep(300);
            return fetchAIWithRetry(prompt, attempt + 1);
        }
        console.error(`Tentativo ${attempt} fallito:`, err);
        throw err;
    }
}
