// js/modal.js
import { fetchAIWithRetry } from './api.js';
import { 
    players, 
    currentPlayerIndex, 
    averageAge, 
    nomeGiocatoreLocale, 
    setCurrentActiveCell 
} from './game.js';

/**
 * Apre il modale di gioco e carica la domanda (da Gemini AI o dal database di riserva locale)
 */
export async function launchQuestion(catIdx, val) {
    const categories = window.aiCategories || [];
    const category = categories[catIdx] || "";
    
    // Salva la cella attualmente attiva nel modulo game
    setCurrentActiveCell({ id: catIdx + "-" + val, category: category, value: val });

    const modal = document.getElementById('game-modal');
    const answerText = document.getElementById('modal-answer');
    
    // Calcolo automatico del turno basato sullo stato live importato
    const activePlayerName = players[currentPlayerIndex]?.name || "";
    const isMyTurn = (activePlayerName === nomeGiocatoreLocale);

    // LOGICA V1: Asimmetria Risposta (Chi gioca non la vede, gli altri sì)
    if (isMyTurn) {
        answerText.classList.add('hidden'); 
    } else {
        answerText.classList.remove('hidden'); 
    }

    // Reset visivo del modale prima del caricamento
    const statusExtra = document.getElementById('modal-status-extra');
    if (statusExtra) statusExtra.innerText = "";
    
    document.getElementById('modal-loading').classList.remove('hidden');
    document.getElementById('modal-content').classList.add('hidden');
    document.getElementById('modal-resolution-zone').classList.add('hidden');
    document.getElementById('modal-action-zone').classList.remove('hidden');
    modal.classList.remove('hidden');

    // Funzione interna per iniettare i dati dal file di backup offline
    function useLocalFallback(reasonMessage, badgeText, isRealError = false) {
        let qText = "Indizio di riserva non trovato.";
        let aText = "N/D";
        
        const backupTrivia = window.BACKUP_TRIVIA || {};
        if (backupTrivia[category] && backupTrivia[category][val]) {
            qText = backupTrivia[category][val].q;
            aText = backupTrivia[category][val].a;
        }

        document.getElementById('modal-badge-cat').innerText = category + " • €" + val;
        document.getElementById('modal-badge-source').innerText = badgeText;
        
        const badgeElement = document.getElementById('modal-badge-source');
        if (isRealError) {
            badgeElement.className = "text-xs px-4 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border-2 border-red-500/50";
        } else {
            badgeElement.className = "text-xs px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-bold uppercase tracking-widest border-2 border-green-500/50";
        }
        
        document.getElementById('modal-question').innerText = qText;
        document.getElementById('modal-answer').innerText = aText;
        
        const debugTracer = document.getElementById('debug-tracer-text');
        if (debugTracer) {
            debugTracer.innerHTML = `Sorgente: <strong class="${isRealError ? 'text-red-400' : 'text-green-400'}">${badgeText}</strong><br>Motivo: ${reasonMessage}`;
        }

        document.getElementById('modal-loading').classList.add('hidden');
        document.getElementById('modal-content').classList.remove('hidden');
    }

    // Coin-flip 50/50 per alternare bilanciamento online/offline
    const coinFlip = Math.random();

    if (coinFlip >= 0.5) {
        setTimeout(() => {
            useLocalFallback(`La moneta (Moneta >= 0.5) ha estratto l'esecuzione offline istantanea.`, "[DATABASE LOCALE]", false);
        }, 300);
    } else {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.innerText = "Interrogazione API Gemini...";

        const difficultyLevels = window.DIFFICULTY_LEVELS || {
            100: { level: 1, desc: "Facile" },
            200: { level: 2, desc: "Medio-Facile" },
            300: { level: 3, desc: "Intermedio" },
            400: { level: 4, desc: "Difficile" },
            500: { level: 5, desc: "Esperto" }
        };
        const config = difficultyLevels[val] || { level: 3, desc: "Standard" };
        
        const promptDomanda = "Sei l'autore senior del quiz Je0pardy!. Genera una singola domanda in italiano per la categoria: \"" + category + "\".\n" +
        "Valore: €" + val + ". Difficoltà richiesta per la casella: livello " + config.level + "/5 (" + config.desc + ")." +
        "\n\nREGOLA DI BILANCIAMENTO GENERALE:\nTutte le domande devono essere tarate sulla cultura e competenze tipiche di persone con un'ETÀ MEDIA DI " + averageAge + " ANNI." +
        "\n\nL'indizio deve essere una affermazione di massimo 12 parole. La risposta deve essere secca (1-3 parole)." +
        "\nRispondi esclusivamente in formato JSON, senza markdown:\n" +
        "{ \"question\": \"Testo indizio\", \"answer\": \"Risposta\" }";

        try {
            const parsed = await fetchAIWithRetry(promptDomanda);
            
            document.getElementById('modal-badge-cat').innerText = category + " • €" + val;
            document.getElementById('modal-badge-source').innerText = "[GENERATO DA AI]";
            document.getElementById('modal-badge-source').className = "text-xs px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border-2 border-purple-500/50";
            document.getElementById('modal-badge-cat').className = "text-xs px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-widest border-2 border-blue-500/50";
            
            document.getElementById('modal-question').innerText = parsed.question || parsed.q;
            document.getElementById('modal-answer').innerText = parsed.answer || parsed.a;
            
            const debugTracer = document.getElementById('debug-tracer-text');
            if (debugTracer) {
                debugTracer.innerHTML = `Sorgente: <strong class="text-purple-400">[LIVE AI VIA API]</strong><br>Motivo: Risposta generata in tempo reale dai server remoti con successo.`;
            }

            document.getElementById('modal-loading').classList.add('hidden');
            document.getElementById('modal-content').classList.remove('hidden');

        } catch (err) {
            useLocalFallback(`${err.message}`, "[FALLBACK LOCALE]", true);
        }
    }
}

/**
 * Rivela la risposta esatta e mostra i bottoni di convalida (Sì/No) per il turno corrente
 */
export function revealAnswer() {
    document.getElementById('modal-action-zone').classList.add('hidden');
    document.getElementById('modal-resolution-zone').classList.remove('hidden');
    
    const activePlayerName = players[currentPlayerIndex]?.name || "Giocatore";
    document.getElementById('modal-turn-prompt').innerText = "🤔 " + activePlayerName + ", risposta esatta?";
}

// Esposizione globale per mantenere compatibili le chiamate inline onclick nell'HTML
window.launchQuestion = launchQuestion;
window.revealAnswer = revealAnswer;