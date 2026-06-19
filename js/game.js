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
    const etaInput = document.getElementById('creatore-eta');
    
    // 1. Recupero Dati (NESSUN FALLBACK A 40)
    const nome = (nomeInput && nomeInput.value.trim() !== '') ? nomeInput.value.trim() : "Master";
    const eta = etaInput ? parseInt(etaInput.value) : null;

    // 2. Controllo Rigoroso
    if (!eta || isNaN(eta) || eta <= 0) {
        alert("Ehi Master, per calcolare l'età media devi inserire la tua età!");
        etaInput.focus();
        etaInput.style.borderColor = "red";
        return; // BLOCCA L'ESECUZIONE
    }
    
    // ... prosegui con la creazione su Supabase
    nomeGiocatoreLocale = nome;
    sessionStorage.setItem("je0pardy_nome", nome); 
    
    players = [{ name: nome, score: 0, correct: 0, wrong: 0, age: eta }];
    
    const { data, error } = await sbClient.from('stanze').insert([{
        stato_tabellone: {}, 
        giocatori: players, 
        turno_di: nome, 
        fase_gioco: 'setup',
        eta_media: eta
    }]).select();

    if (!error) window.location.search = `?room=${data[0].id}`;
    else alert("Errore di connessione al database.");
}
export async function uniscitiAStanzaCloud() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    // Recupero elementi
    const nomeEl = document.getElementById('ospite-nome');
    const etaEl = document.getElementById('ospite-eta');
    
    const nomeInput = nomeEl ? nomeEl.value.trim() : "";
    const etaInput = etaEl ? parseInt(etaEl.value) : null;

    // Validazione rigorosa: blocchiamo se il nome è vuoto o l'età non è un numero valido > 0
    if (!nomeInput) {
        alert("Inserisci un nome valido!");
        return;
    }
    if (!etaInput || isNaN(etaInput) || etaInput <= 0) {
        alert("Per favore, inserisci un'età valida!");
        return;
    }

    // Recupero dati stanza
    const { data: stanzaData, error } = await sbClient.from('stanze').select('giocatori').eq('id', roomId).single();
    
    if (error || !stanzaData) {
        alert("Errore nel caricamento della stanza.");
        return;
    }

    let giocatoriDB = stanzaData.giocatori || [];
    
    // Controlliamo che il nome non sia già preso
    if (!giocatoriDB.find(p => p.name === nomeInput)) {
        giocatoriDB.push({ name: nomeInput, score: 0, correct: 0, wrong: 0, age: etaInput });
        
        // Calcolo media età aggiornato
        const media = Math.round(giocatoriDB.reduce((sum, p) => sum + p.age, 0) / giocatoriDB.length);
        
        const { error: updateError } = await sbClient
            .from('stanze')
            .update({ giocatori: giocatoriDB, eta_media: media })
            .eq('id', roomId);
            
        if (updateError) {
            console.error("Errore update DB:", updateError);
            alert("Errore durante l'ingresso in stanza. Riprova.");
            return;
        }
    }
    
    sessionStorage.setItem("je0pardy_nome", nomeInput); 
    window.location.reload(); 
}
// Esposizione globale per i bottoni HTML (Risolve l'errore is not a function)
window.creaNuovaStanzaCloud = creaNuovaStanzaCloud;
window.uniscitiAStanzaCloud = uniscitiAStanzaCloud;