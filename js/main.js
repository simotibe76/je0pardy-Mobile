// js/main.js
console.log("DEBUG: main.js caricato correttamente");
import { avviaSincronizzazioneInTempoReale, nomeGiocatoreLocale, players, currentPlayerIndex, gameBoardState, averageAge } from './game.js';
import { renderSetupScreen, renderLobbyAttesa, renderGameBoard, renderLoadingScreen } from './ui.js';
import * as modals from './modal.js'; // Importiamo i modali

// Assicurati che l'app parta
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const nome = sessionStorage.getItem("je0pardy_nome");

    if (roomId && nome) {
        renderLoadingScreen();
        avviaSincronizzazioneInTempoReale(roomId, (fase) => {
            console.log("DEBUG: [MAIN] Rendering fase di gioco:", fase);
            if (fase === 'board') {
                renderGameBoard(players, currentPlayerIndex, gameBoardState, averageAge, nomeGiocatoreLocale);
            } else {
                renderLobbyAttesa(players, nomeGiocatoreLocale, roomId);
            }
        });
    } else if (roomId) {
        renderSetupScreen(roomId);
    } else {
        renderSetupScreen();
    }
});
