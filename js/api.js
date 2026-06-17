// js/api.js
export const sbClient = supabase.createClient(
    "https://dtgitfiutlmymlgysovj.supabase.co", 
    "sb_publishable_w688bWi3FPCUDEPHumsqPA_QAils40A"
);

export async function fetchAI(prompt, model, apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: "Rispondi solo JSON." }] },
            generationConfig: { responseMimeType: "application/json" }
        })
    });
    if (!response.ok) throw new Error("Errore API");
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text.trim());
}
