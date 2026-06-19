// js/game.js
import { sbClient } from './api.js';

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

export function aggiornaStatoLocale(datiCloud, callback) {
    players = datiCloud.giocatori || [];
    gameBoardState = datiCloud.stato_tabellone || {};
    averageAge = datiCloud.eta_media || 40;
    let indiceTurno = players.findIndex(p => p.name === datiCloud.turno_di);
    currentPlayerIndex = indiceTurno !== -1 ? indiceTurno : 0;

    // Esegue il callback (passando la fase di gioco) per aggiornare la UI nel modulo main/ui
    if (callback) callback(datiCloud.fase_gioco);
}

export async function avviaSincronizzazioneInTempoReale(roomId, callback) {
    console.log("DEBUG: [GAME MODULE] Avvio ascolto Realtime per la stanza:", roomId);
    
    // Caricamento iniziale dei dati della stanza
    const { data, error } = await sbClient.from('stanze').select('*').eq('id', roomId).single();
    if (data) {
        aggiornaStatoLocale(data, callback);
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
                aggiornaStatoLocale(payload.new, callback);
            })
            .subscribe();
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
    if (!currentActiveCell) return;
    const val = currentActiveCell.value;
    
    if (isCorrect) { 
        players[currentPlayerIndex].score += val; 
        players[currentPlayerIndex].correct++; 
    } else { 
        players[currentPlayerIndex].score -= val; 
        players[currentPlayerIndex].wrong++; 
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length; 
    }
    gameBoardState[currentActiveCell.id] = true;
    
    await sbClient.from('stanze')
        .update({ 
            giocatori: players, 
            stato_tabellone: gameBoardState,
            turno_di: players[currentPlayerIndex].name 
        })
        .eq('id', currentRoomId);

    currentActiveCell = null;
    document.getElementById('game-modal').classList.add('hidden');
}

// Exponiamo le funzioni a livello globale (window) per non rompere gli "onclick" presenti nei bottoni dell'HTML
window.creaNuovaStanzaCloud = creaNuovaStanzaCloud;
window.uniscitiAStanzaCloud = uniscitiAStanzaCloud;
window.avviaPartitaCloud = avviaPartitaCloud;
window.resolveTurn = resolveTurn;