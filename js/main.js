// js/main.js
import { avviaSincronizzazioneInTempoReale } from './game.js';
import { renderSetupScreen } from './ui.js';
import * as modals from './modal.js'; // Importiamo i modali

// Assicurati che l'app parta
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const nome = sessionStorage.getItem("je0pardy_nome");

    if (roomId && nome) {
        avviaSincronizzazioneInTempoReale(roomId);
    } else {
        renderSetupScreen();
    }
});
