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

    try {
        const response = await fetch(pureUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        // Gestione saturazione o rate limit (HTTP 429 o 503)
        if (response.status === 429 || response.status === 503) {
            console.warn(`[RETRY] HTTP ${response.status}. Cambio slot chiave...`);
            await sleep(300);
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            if (attempt < 3) {
                currentModelIndex = (currentModelIndex + 1) % modelChain.length;
                return await fetchAIWithRetry(prompt, attempt + 1); 
            }
        }

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Codice HTTP ${response.status} - ${errorDetails}`);
        }

        // Avanza il modello per distribuire le chiamate successive
        currentModelIndex = (currentModelIndex + 1) % modelChain.length;

        const data = await response.json();
        let rawText = data.candidates[0].content.parts[0].text.trim();
        
        // Pulizia forzata da eventuali tag markdown restrittivi
        if (rawText.startsWith("```")) {
            rawText = rawText.replace(/```json|```/g, "").trim();
        }
        return JSON.parse(rawText);

    } catch (err) {
        console.error("Tentativo " + attempt + " fallito:", err);
        if (attempt < 3) {
            await sleep(300);
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            currentModelIndex = (currentModelIndex + 1) % modelChain.length;
            return await fetchAIWithRetry(prompt, attempt + 1);
        }
        throw err;
    }
}