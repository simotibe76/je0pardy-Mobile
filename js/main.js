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
            console.log("DEBUG: [MAIN] Rendering fase di gioco:", fase, "nome sessione:", nome, "Dati:", stanzaData);
            const isRoomPlayerKnown = nome && stanzaData?.giocatori?.some(p => p.name === nome);

            if (!nome || !isRoomPlayerKnown) {
                renderSetupScreen(roomId);
                return;
            }

            if (fase === 'board') {
                // Quando si torna al tabellone, assicurati che il modale sia chiuso
                document.getElementById('game-modal').classList.add('hidden');
                renderGameBoard(players, gameBoardState, averageAge, nome, stanzaData.turno_di);
            } else if (fase === 'question') {
                // Nascondi il tabellone e mostra la domanda a tutti
                document.getElementById('app').innerHTML = '';
                modals.launchQuestion(stanzaData, players, nome);
            } else if (fase === 'reveal') {
                // Non pulire la UI (il modale è già aperto), mostra solo la risposta
                modals.revealAnswer(stanzaData, players, nome);
            } else {
                renderLobbyAttesa(players, nomeGiocatoreLocale, roomId);
            }
        });
    } else {
        renderSetupScreen();
    }
});
