// js/game.js
import { sbClient } from './api.js';

// Esportiamo lo stato per renderlo accessibile ad altri moduli
export let gameState = {
    players: [],
    currentPlayerIndex: 0,
    boardState: {},
    roomId: null
};

// Funzione di aggiornamento stato (utile per evitare variabili globali sparse)
export function updateLocalState(datiCloud, callback) {
    gameState.players = datiCloud.giocatori || [];
    gameState.boardState = datiCloud.stato_tabellone || {};
    if (callback) callback(gameState);
}

export async function avviaSincronizzazioneInTempoReale(roomId, callback) {
    gameState.roomId = roomId;
    
    // Caricamento iniziale
    const { data, error } = await sbClient.from('stanze').select('*').eq('id', roomId).single();
    if (data) {
        updateLocalState(data, callback);
    }

    // Sottoscrizione Realtime
    return sbClient.channel('stanza_' + roomId)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'stanze', 
            filter: 'id=eq.' + roomId 
        }, (payload) => {
            updateLocalState(payload.new, callback);
        })
        .subscribe();
}

// ==========================================
// FUNZIONI DI GESTIONE STANZA (Recuperate dal file originale)
// ==========================================

export async function creaNuovaStanzaCloud() {
    const nomeInput = document.getElementById('creatore-nome');
    const nome = (nomeInput && nomeInput.value.trim() !== '') ? nomeInput.value.trim() : "Master";
    
    // Fallback sicuro se il campo età non è presente nella UI ridotta
    const etaInput = document.getElementById('creatore-eta');
    const eta = (etaInput && etaInput.value) ? parseInt(etaInput.value) : 40;
    
    sessionStorage.setItem("je0pardy_nome", nome); 
    
    const players = [{ name: nome, score: 0, correct: 0, wrong: 0, age: eta }];
    
    const { data, error } = await sbClient.from('stanze').insert([{
        stato_tabellone: {}, 
        giocatori: players, 
        turno_di: nome, 
        fase_gioco: 'setup', 
        eta_media: eta 
    }]).select();

    if (!error && data.length > 0) {
        window.location.search = `?room=${data[0].id}`;
    } else {
        console.error("Errore DB:", error);
    }
}

export async function uniscitiAStanzaCloud() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    const nomeInput = document.getElementById('ospite-nome').value.trim();
    const etaInput = document.getElementById('ospite-eta') ? parseInt(document.getElementById('ospite-eta').value) : 40;

    const { data: stanzaData, error } = await sbClient.from('stanze').select('giocatori').eq('id', roomId).single();
    if (error || !stanzaData) return;

    let giocatoriDB = stanzaData.giocatori || [];
    if (!giocatoriDB.find(p => p.name === nomeInput)) {
        giocatoriDB.push({ name: nomeInput, score: 0, correct: 0, wrong: 0, age: etaInput });
        const media = Math.round(giocatoriDB.reduce((sum, p) => sum + p.age, 0) / giocatoriDB.length);
        await sbClient.from('stanze').update({ giocatori: giocatoriDB, eta_media: media }).eq('id', roomId);
    }
    
    sessionStorage.setItem("je0pardy_nome", nomeInput); 
    window.location.reload(); // Ricarica per avviare la partita
}

// Esposizione globale per i bottoni HTML (Risolve l'errore is not a function)
window.creaNuovaStanzaCloud = creaNuovaStanzaCloud;
window.uniscitiAStanzaCloud = uniscitiAStanzaCloud;