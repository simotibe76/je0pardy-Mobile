// js/modal.js

/**
 * [NUOVO] Mostra il modale in stato di caricamento.
 * Utile per dare un feedback immediato all'utente prima di operazioni lunghe.
 */
export function showLoadingModal(message = "Generazione domanda in corso...") {
    const modal = document.getElementById('game-modal');
    modal.classList.remove('hidden');

    // Mostra il caricamento, nascondi il contenuto principale
    document.getElementById('modal-loading').classList.remove('hidden');
    document.getElementById('modal-content').classList.add('hidden');
    
    // Aggiorna il testo del caricamento
    const loadingText = document.getElementById('loading-text');
    if(loadingText) loadingText.innerText = message;

    // Pulisci il testo di stato extra
    const statusExtra = document.getElementById('modal-status-extra');
    if (statusExtra) statusExtra.innerText = '';
}

/**
 * Apre il modale e mostra la domanda ricevuta dallo stato della stanza.
 */
export function launchQuestion(stanzaData, players, nomeGiocatoreLocale) {
    console.log("DEBUG: [MODAL] launchQuestion chiamato con:", stanzaData);
    const questionData = stanzaData?.stato_domanda;
    if (!questionData) return;

    const { category, value, question, source } = questionData;

    const modal = document.getElementById('game-modal');
    modal.classList.remove('hidden');

    // Mostra il contenuto, nascondi il caricamento e la risoluzione
    document.getElementById('modal-content').classList.remove('hidden');
    document.getElementById('modal-loading').classList.add('hidden');
    document.getElementById('modal-resolution-zone').classList.add('hidden');
    // Nascondi il contenitore della risposta all'avvio della domanda
    document.getElementById('modal-answer-container').classList.add('hidden');

    // Popola i dati della domanda
    document.getElementById('modal-badge-cat').innerText = `${category} • €${value}`;
    const sourceBadge = document.getElementById('modal-badge-source');
    sourceBadge.innerText = `[${source}]`;
    sourceBadge.className = `text-xs px-4 py-2 rounded-full font-bold uppercase tracking-widest border-2 ${
        source === 'GENERATO DA AI' 
        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' 
        : 'bg-green-500/20 text-green-400 border-green-500/50'
    }`;
    document.getElementById('modal-question').innerText = question;

    // Logica per il Master: solo lui vede il pulsante per rivelare la risposta
    const isMaster = players.length > 0 && players[0].name === nomeGiocatoreLocale;
    if (isMaster) {
        document.getElementById('modal-action-zone').classList.remove('hidden');
        // Corregge l'azione del pulsante per chiamare la funzione corretta
        document.querySelector('#modal-action-zone button').setAttribute('onclick', 'window.revealAnswerToAll()');
        document.getElementById('modal-waiting-for-reveal').classList.add('hidden');
    } else {
        document.getElementById('modal-action-zone').classList.add('hidden');
        document.getElementById('modal-waiting-for-reveal').classList.remove('hidden');
    }
}

/**
 * Rivela la risposta e mostra i pulsanti di validazione al Master.
 */
export function revealAnswer(stanzaData, players, nomeGiocatoreLocale) {
    console.log("DEBUG: [MODAL] revealAnswer chiamato con:", stanzaData);
    const questionData = stanzaData?.stato_domanda;
    if (!questionData) return;
    
    // Nascondi la zona "Mostra Soluzione" e il messaggio di attesa
    document.getElementById('modal-action-zone').classList.add('hidden');
    document.getElementById('modal-waiting-for-reveal').classList.add('hidden');
    
    // Popola e mostra la risposta a TUTTI
    document.getElementById('modal-answer-container').classList.remove('hidden');
    document.getElementById('modal-answer').innerText = questionData.answer;
    
    // Logica per il Master: solo lui vede i pulsanti per giudicare
    const isMaster = players.length > 0 && players[0].name === nomeGiocatoreLocale;
    const activePlayerName = stanzaData.turno_di || "Giocatore";
    document.getElementById('modal-turn-prompt').innerText = `🤔 ${activePlayerName}, risposta esatta?`;

    if (isMaster) {
        document.getElementById('modal-resolution-zone').classList.remove('hidden');
        document.getElementById('modal-waiting-for-master').classList.add('hidden');
    } else {
        document.getElementById('modal-resolution-zone').classList.add('hidden');
        document.getElementById('modal-waiting-for-master').classList.remove('hidden');
    }
}