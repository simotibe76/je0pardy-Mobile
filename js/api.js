// js/api.js

// Inizializzazione Client Supabase
export const sbClient = supabase.createClient(
    "https://dtgitfiutlmymlgysovj.supabase.co", 
    "sb_publishable_w688bWi3FPCUDEPHumsqPA_QAils40A"
);

// Configurazione interna delle chiavi recuperate da chiavi.js
const API_KEYS = typeof CONTENITORE_CHIAVI !== 'undefined' ? CONTENITORE_CHIAVI : [];
let currentKeyIndex = 0;
let currentModelIndex = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Interroga l'API di Gemini gestendo in modo trasparente errori,
 * rotazione automatica delle chiavi e cambio di modello (fallback chain).
 */
export async function fetchAIWithRetry(prompt, attempt = 1) {
    if (API_KEYS.length === 0) {
        throw new Error("Nessuna chiave trovata nel file chiavi.js. Verifica il setup!");
    }
    
    // Recupera la catena dei modelli configurata (fallback su array locale se non definita)
    const modelChain = window.MODEL_CHAIN || ["gemini-2.5-flash", "gemini-2.0-flash"];
    const model = modelChain[currentModelIndex % modelChain.length];
    const activeKey = API_KEYS[currentKeyIndex].trim(); 
    
    const systemInstruction = "Rispondi ESCLUSIVAMENTE con un oggetto JSON valido. Non includere blocchi di codice markdown ```json o testo extra.";
    const pureUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

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