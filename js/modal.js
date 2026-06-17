// js/modal.js
export function launchQuestion(catIdx, val, isMyTurn) {
    const modal = document.getElementById('game-modal');
    const answerContainer = document.getElementById('modal-resolution-zone');
    const answerText = document.getElementById('modal-answer');

    // LOGICA V1: Asimmetria Risposta
    if (isMyTurn) {
        answerText.classList.add('hidden'); // Giocatore attivo NON vede la risposta
    } else {
        answerText.classList.remove('hidden'); // Gli altri vedono la risposta
    }

    modal.classList.remove('hidden');
    // ... resto della logica di caricamento (fetch/fallback)
}

// Esponiamo al DOM
window.modals = { launchQuestion };
