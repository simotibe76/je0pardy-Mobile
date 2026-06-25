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

    if (roomId) {
        renderLoadingScreen();
        avviaSincronizzazioneInTempoReale(roomId, (fase, stanzaData) => {
            console.log("DEBUG: [MAIN] Rendering fase di gioco:", fase, "nome sessione:", nome);
            const isRoomPlayerKnown = nome && stanzaData?.giocatori?.some(p => p.name === nome);

            if (!nome || !isRoomPlayerKnown) {
                renderSetupScreen(roomId);
                return;
            }

            if (fase === 'board') {
                renderGameBoard(players, currentPlayerIndex, gameBoardState, averageAge, nomeGiocatoreLocale);
            } else {
                renderLobbyAttesa(players, nomeGiocatoreLocale, roomId);
            }
        });
    } else {
        renderSetupScreen();
    }
});
