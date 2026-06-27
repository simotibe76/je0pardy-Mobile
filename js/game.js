import { sbClient, fetchAIWithRetry } from './api.js';

// ==========================================
// STATO GLOBALE DEL GIOCO (Esportato per gli altri moduli)
// ==========================================
export const currentRoomId = new URLSearchParams(window.location.search).get('room');
export let nomeGiocatoreLocale = sessionStorage.getItem("je0pardy_nome") || "";
export let players = [];
export let currentPlayerIndex = 0;
export let gameBoardState = {};
export let averageAge = 40;
export let realtimeChannel = null;
export let currentActiveCell = null; // Gestito dal modale

// Funzioni di utilità per aggiornare lo stato dall'esterno (es. dal modulo modal)
export function setNomeGiocatoreLocale(val) { nomeGiocatoreLocale = val; }
export function setCurrentActiveCell(val) { currentActiveCell = val; }

// ==========================================
// LOGICA DI SINCRONIZZAZIONE (DB & REALTIME)
// ==========================================

export function aggiornaStatoLocale(datiCloud) {
    players = datiCloud.giocatori || [];
    gameBoardState = datiCloud.stato_tabellone || {};
    averageAge = datiCloud.eta_media || 40;
    let indiceTurno = players.findIndex(p => p.name === datiCloud.turno_di);
    currentPlayerIndex = indiceTurno !== -1 ? indiceTurno : 0;
}

export async function avviaSincronizzazioneInTempoReale(roomId, callback) {
    console.log("DEBUG: [GAME MODULE] Avvio ascolto Realtime per la stanza:", roomId);
    
    // Caricamento iniziale dei dati della stanza
    const { data, error } = await sbClient.from('stanze').select('*').eq('id', roomId).single();
    if (error) {
        console.error("DEBUG: [GAME MODULE] Errore caricamento stanza iniziale:", error);
        if (callback) callback('setup', null);
        return null;
    }

    if (data) {
        console.log("DEBUG: [GAME MODULE] Dati stanza iniziali caricati", data);
        aggiornaStatoLocale(data);
        if (callback) callback(data.fase_gioco, data);
    } else {
        console.warn("DEBUG: [GAME MODULE] Nessun dato stanza trovato per roomId:", roomId);
        if (callback) callback('setup', null);
    }

    // Abbonamento al canale Realtime (Postgres Changes)
    if (!realtimeChannel) {
        realtimeChannel = sbClient.channel('stanza_' + roomId)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'stanze', 
                filter: 'id=eq.' + roomId 
            }, (payload) => {
                console.log("DEBUG: [GAME MODULE] Stato DB cambiato, sincronizzo...");
                aggiornaStatoLocale(payload.new);
                if (callback) callback(payload.new.fase_gioco, payload.new);
            })
            .subscribe();
        console.log("DEBUG: [GAME MODULE] Canale realtime sottoscritto:", realtimeChannel);
    }
    return realtimeChannel;
}

// ==========================================
// FUNZIONI DI GESTIONE STANZA & TURNI
// ==========================================

export async function creaNuovaStanzaCloud() {
    const nomeInput = document.getElementById('creatore-nome').value.trim();
    const etaInput = document.getElementById('creatore-eta').value;
    const eta = parseInt(etaInput);
    
    if (!nomeInput || isNaN(eta) || eta <= 0) {
        alert("Attenzione: devi inserire un nome valido e un'età corretta per iniziare!");
        return;
    }
    
    nomeGiocatoreLocale = nomeInput;
    sessionStorage.setItem("je0pardy_nome", nomeInput); 
    
    players = [{ name: nomeInput, score: 0, correct: 0, wrong: 0, age: eta }];
    
    const { data, error } = await sbClient.from('stanze').insert([{
        stato_tabellone: {}, 
        giocatori: players, 
        turno_di: nomeInput, 
        fase_gioco: 'setup',
        eta_media: eta 
    }]).select();

    if (!error) {
        window.location.search = `?room=${data[0].id}`;
    } else {
        alert("Errore durante la creazione della stanza: " + error.message);
    }
}

export async function uniscitiAStanzaCloud() {
    const nomeInput = document.getElementById('ospite-nome').value.trim();
    const etaInput = parseInt(document.getElementById('ospite-eta').value);

    if (!nomeInput || isNaN(etaInput) || etaInput <= 0) {
        alert("Inserisci nome ed età validi!");
        return;
    }

    const { data: stanzaData, error } = await sbClient
        .from('stanze')
        .select('giocatori')
        .eq('id', currentRoomId)
        .single();

    if (error || !stanzaData) {
        alert("Errore nel recupero dati della stanza.");
        return;
    }

    let giocatoriDB = stanzaData.giocatori || [];
    
    if (!giocatoriDB.find(p => p.name === nomeInput)) {
        giocatoriDB.push({ name: nomeInput, score: 0, correct: 0, wrong: 0, age: etaInput });
        
        // Ricalcola l'età media di tutti i partecipanti
        const media = Math.round(giocatoriDB.reduce((sum, p) => sum + p.age, 0) / giocatoriDB.length);

        const { error: updateError } = await sbClient.from('stanze').update({ 
            giocatori: giocatoriDB,
            eta_media: media 
        }).eq('id', currentRoomId);

        if (updateError) {
            alert("Errore durante l'inserimento nella stanza.");
            return;
        }
    }
    
    nomeGiocatoreLocale = nomeInput;
    sessionStorage.setItem("je0pardy_nome", nomeInput); 
    window.location.reload();
}

export async function avviaPartitaCloud() {
    if (!currentRoomId) return;
    await sbClient.from('stanze').update({ fase_gioco: 'board' }).eq('id', currentRoomId);
}

export async function resolveTurn(isCorrect) {
    console.log(`DEBUG: [GAME] resolveTurn chiamato con isCorrect: ${isCorrect}`);
    if (!currentActiveCell) {
        console.error("resolveTurn chiamato senza una cella attiva.");
        return;
    }
    const val = currentActiveCell.value;

    const { data: stanza, error } = await sbClient
        .from('stanze')
        .select('giocatori, stato_tabellone, turno_di')
        .eq('id', currentRoomId)
        .single();

    if (error) {
        console.error("Errore nel recuperare lo stato della stanza in resolveTurn:", error);
        return;
    }

    let playersDB = stanza.giocatori || [];
    let boardDB = stanza.stato_tabellone || {};
    let turnoAttuale = stanza.turno_di;

    let playerIndex = playersDB.findIndex(p => p.name === turnoAttuale);
    if (playerIndex === -1) {
        console.error("Giocatore di turno non trovato:", turnoAttuale);
        return;
    }

    if (isCorrect) {
        playersDB[playerIndex].score += val;
        playersDB[playerIndex].correct++;
    } else {
        playersDB[playerIndex].score -= val;
        playersDB[playerIndex].wrong++;
        playerIndex = (playerIndex + 1) % playersDB.length;
        turnoAttuale = playersDB[playerIndex].name;
    }

    boardDB[currentActiveCell.id] = true;

    await sbClient.from('stanze')
        .update({
            giocatori: playersDB,
            stato_tabellone: boardDB,
            turno_di: turnoAttuale,
            fase_gioco: 'board',
            stato_domanda: null
        })
        .eq('id', currentRoomId);
}

/**
 * [NUOVO] Chiamata quando il giocatore di turno seleziona una casella.
 * Genera la domanda e aggiorna lo stato della stanza su Supabase.
 */
export async function selectQuestion(catIdx, val) {
    console.log(`DEBUG: [GAME] selectQuestion triggered for catIdx: ${catIdx}, val: ${val}`);
    
    const { data: stanza, error } = await sbClient.from('stanze').select('eta_media').eq('id', currentRoomId).single();
    if (error) { console.error("Impossibile leggere lo stato della stanza:", error); return; }

    const categories = window.aiCategories || [];
    const category = categories[catIdx] || "";
    
    // Imposta la cella attiva per la risoluzione successiva
    setCurrentActiveCell({ id: catIdx + "-" + val, category: category, value: val });

    let questionData = {
        question: "Errore di generazione",
        answer: "N/D",
        source: "Error",
        category: category,
        value: val
    };

    // Funzione interna per usare il backup
    function useLocalFallback() {
        const backupTrivia = window.BACKUP_TRIVIA || {};
        if (backupTrivia[category] && backupTrivia[category][val]) {
            const item = Array.isArray(backupTrivia[category][val]) ? backupTrivia[category][val][0] : backupTrivia[category][val];
            questionData.question = item.q;
            questionData.answer = item.a;
            questionData.source = "DATABASE LOCALE";
        }
    }

    // Coin-flip 50/50 per usare AI o backup
    if (Math.random() >= 0.5) {
        useLocalFallback();
    } else {
        try {
            const difficultyLevels = window.DIFFICULTY_LEVELS || {};
            const config = difficultyLevels[val] || { level: 3, desc: "Standard" };
            const promptDomanda = `Sei l'autore senior del quiz Je0pardy!. Genera una singola domanda in italiano per la categoria: "${category}".
Valore: €${val}. Difficoltà richiesta: livello ${config.level}/5 (${config.desc}).
Tieni conto di un'età media dei partecipanti di ${stanza.eta_media} anni.
L'indizio deve essere una affermazione (max 12 parole). La risposta deve essere secca (1-3 parole).
Rispondi esclusivamente in formato JSON, senza markdown: { "question": "Testo indizio", "answer": "Risposta" }`;

            const parsed = await fetchAIWithRetry(promptDomanda);
            questionData.question = parsed.question || parsed.q;
            questionData.answer = parsed.answer || parsed.a;
            questionData.source = "GENERATO DA AI";
        } catch (err) {
            console.error("Errore API, uso fallback:", err);
            useLocalFallback();
            questionData.source = "FALLBACK LOCALE";
        }
    }

    // Aggiorna lo stato della stanza nel DB, cambiando la fase a 'question'
    await sbClient.from('stanze').update({
        fase_gioco: 'question',
        stato_domanda: questionData
    }).eq('id', currentRoomId);
}

/**
 * [NUOVO] Chiamata dal Master per rivelare la risposta a tutti.
 */
export async function revealAnswerToAll() {
    console.log("DEBUG: [GAME] revealAnswerToAll triggered. Changing phase to 'reveal'.");
    await sbClient.from('stanze').update({
        fase_gioco: 'reveal'
    }).eq('id', currentRoomId);
}

// Exponiamo le funzioni a livello globale (window) per non rompere gli "onclick" presenti nei bottoni dell'HTML
window.creaNuovaStanzaCloud = creaNuovaStanzaCloud;
window.uniscitiAStanzaCloud = uniscitiAStanzaCloud;
window.avviaPartitaCloud = avviaPartitaCloud;
window.resolveTurn = resolveTurn;
window.selectQuestion = selectQuestion;
window.revealAnswerToAll = revealAnswerToAll;