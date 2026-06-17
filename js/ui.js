// js/ui.js
import { launchQuestion } from './modal.js';

// Assicurati che aiCategories e valoriTabellone siano accessibili (importali da config.js se necessario)
// Se sono globali, assicurati che il file config.js sia caricato prima di ui.js nell'index.html

export function renderGameBoard(players, currentPlayerIndex, gameBoardState, averageAge, nomeGiocatoreLocale) {
    const app = document.getElementById('app');
    const isMyTurn = (players[currentPlayerIndex].name === nomeGiocatoreLocale);

    let playersHtml = players.map((p, idx) => `
        <div class="flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${idx === currentPlayerIndex ? 'border-yellow-400 bg-yellow-400/10 shadow-lg scale-105' : 'border-slate-800 bg-slate-900/40'}">
            <span class="text-xs font-bold uppercase ${idx === currentPlayerIndex ? 'text-yellow-400' : 'text-slate-400'}">${p.name}</span>
            <span class="text-2xl font-black ${p.score >= 0 ? 'text-green-400' : 'text-red-400'}">${p.score} €</span>
        </div>
    `).join('');

    let gridCells = '';
    
    // Assicurati che aiCategories e valoriTabellone siano definiti o importati
    aiCategories.forEach((cat, catIdx) => {
        valoriTabellone.forEach(val => {
            const cellId = `${catIdx}-${val}`;
            if (gameBoardState[cellId]) {
                gridCells += `<div class="bg-slate-950/80 border border-slate-900 flex items-center justify-center min-h-[55px] text-slate-700 font-bold text-sm">❌</div>`;
            } else {
                // Utilizziamo window.modals.launchQuestion come esposto nel modulo modal.js
                gridCells += `
                <button onclick="window.modals.launchQuestion(${catIdx}, ${val}, ${isMyTurn})" 
                        class="bg-blue-950/40 border border-slate-800 hover:bg-blue-600 text-yellow-400 font-black text-xl transition duration-150 flex items-center justify-center min-h-[55px] ${!isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}" 
                        ${!isMyTurn ? 'disabled' : ''}>
                    ${val}€
                </button>`;
            }
        });
    });

    app.innerHTML = `
    <div class="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${playersHtml}</div>
        <div class="grid grid-cols-5 gap-2">${gridCells}</div>
    </div>`;
}

export function renderSetupScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="w-full max-w-2xl bg-slate-900 border-4 border-yellow-500 p-8 rounded-3xl text-center">
        <h1 class="text-4xl font-black text-yellow-400 mb-6">JE0PARDY! CLOUD</h1>
        <input id="creatore-nome" type="text" class="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold" value="Master" />
        <button onclick="window.creaNuovaStanzaCloud()" class="w-full bg-yellow-400 p-4 rounded-xl font-black uppercase">Crea Stanza</button>
    </div>`;
}

export function renderLobbyAttesa(players, nomeGiocatoreLocale, currentRoomId) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="text-white">Lobby per ${currentRoomId} - Giocatori: ${players.length}</div>`;
}
