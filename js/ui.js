// js/ui.js

/**
 * Mostra la schermata di configurazione iniziale (Creatore o Ospite)
 */
export function renderSetupScreen(currentRoomId, nomeGiocatoreLocale) {
    const app = document.getElementById('app');
    
    if (!currentRoomId) {
        // SCHERMATA CREATORE
        app.innerHTML = `
        <div class="w-full max-w-2xl bg-slate-900 border-4 border-yellow-500 p-8 rounded-3xl shadow-2xl text-center">
            <h1 class="text-4xl font-black text-yellow-400 mb-6">JE0PARDY! CLOUD</h1>
            <input id="creatore-nome" type="text" class="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold" placeholder="Il tuo nome" value="Master" />
            <input id="creatore-eta" type="number" class="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold" placeholder="La tua età" />
            <button onclick="window.creaNuovaStanzaCloud()" class="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 p-4 rounded-xl font-black uppercase transition">Crea Nuova Stanza</button>
        </div>`;
    } else if (currentRoomId && !nomeGiocatoreLocale) {
        // SCHERMATA GUEST
        app.innerHTML = `
        <div class="w-full max-w-2xl bg-slate-900 border-4 border-blue-500 p-8 rounded-3xl shadow-2xl text-center">
            <h1 class="text-4xl font-black text-blue-400 mb-6">UNISCITI ALLA STANZA</h1>
            <input id="ospite-nome" type="text" class="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold" placeholder="Il tuo nome" />
            <input id="ospite-eta" type="number" class="w-full p-3 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold" placeholder="La tua età" />
            <button onclick="window.uniscitiAStanzaCloud()" class="w-full bg-blue-500 hover:bg-blue-600 p-4 rounded-xl text-white font-black uppercase transition">Entra nel Gioco</button>
        </div>`;
    }
}

/**
 * Renderizza la sala d'attesa prima dell'avvio della partita
 */
export function renderLobbyAttesa(players, nomeGiocatoreLocale, currentRoomId) {
    const app = document.getElementById('app');
    const isCreatore = players.length > 0 && players[0].name === nomeGiocatoreLocale;
    
    const giocatoriHtml = players.map(p => `
        <span class="px-4 py-2 bg-slate-800 border ${p.name === nomeGiocatoreLocale ? 'border-yellow-400 text-yellow-400' : 'border-slate-700 text-white'} rounded-full text-sm font-bold m-1 inline-block">
            ${p.name}
        </span>
    `).join('');

    app.innerHTML = `
    <div class="w-full max-w-2xl bg-slate-900 border-4 border-green-500 p-8 rounded-3xl shadow-2xl text-center">
        <h1 class="text-4xl font-black text-green-400 mb-2">LOBBY D'ATTESA</h1>
        <p class="text-slate-400 mb-6 text-sm font-mono">ID: ${currentRoomId}</p>
        
        <div class="p-6 bg-slate-950 rounded-xl border border-slate-800 mb-8">
            <p class="text-sm text-slate-400 mb-4 uppercase tracking-widest font-bold">Giocatori Connessi</p>
            <div class="flex flex-wrap justify-center gap-2">${giocatoriHtml}</div>
        </div>

        ${isCreatore ? 
            `<button onclick="window.avviaPartitaCloud()" class="w-full bg-yellow-400 hover:bg-yellow-500 p-4 rounded-xl text-slate-950 font-black uppercase transition text-xl shadow-lg animate-pulse">🚀 INIZIA PARTITA</button>` 
            : 
            `<div class="p-4 rounded-xl border border-blue-500/50 bg-blue-500/10 text-blue-400 font-bold animate-pulse">In attesa che il creatore avvii la partita... ⏳</div>`
        }
    </div>`;
}

/**
 * Disegna il tabellone principale di gioco a 10 colonne (Categorie + Celle Valori)
 */
export function renderGameBoard(players, currentPlayerIndex, gameBoardState, averageAge, nomeGiocatoreLocale) {
    const app = document.getElementById('app');
    const aiCategories = window.aiCategories || [];
    const valoriTabellone = window.valoriTabellone || [];
    
    const numeroTotaleCelle = aiCategories.length * valoriTabellone.length;
    const celleCompletate = Object.keys(gameBoardState).length;
    const isMyTurn = (players[currentPlayerIndex]?.name === nomeGiocatoreLocale);

    // Se il tabellone è esaurito, dirotta automaticamente sulla schermata di fine partita
    if (celleCompletate >= numeroTotaleCelle && numeroTotaleCelle > 0) {
        renderEndGameScreen(players);
        return;
    }

    // Sezione dei punteggi dei giocatori
    let playersHtml = players.map((p, idx) => `
        <div class="flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${idx === currentPlayerIndex ? 'border-yellow-400 bg-yellow-400/10 shadow-lg scale-105' : 'border-slate-800 bg-slate-900/40'}">
            <span class="text-xs font-bold uppercase tracking-wider ${idx === currentPlayerIndex ? 'text-yellow-400' : 'text-slate-400'}">${p.name}</span>
            <span class="text-2xl font-black mt-1 ${p.score >= 0 ? 'text-green-400' : 'text-red-400'}">${p.score} €</span>
        </div>
    `).join('');

    // Intestazioni delle categorie
    let gridHeaders = aiCategories.map(cat => `
        <div class="bg-slate-900 border border-slate-800 p-2 text-center flex items-center justify-center min-h-[60px] rounded-t-lg">
            <span class="text-sm font-black uppercase text-blue-400 tracking-wide">${cat}</span>
        </div>
    `).join('');

    // Generazione della griglia dinamica bilanciata sui turni
    let gridCells = '';
    valoriTabellone.forEach(val => {
        aiCategories.forEach((cat, catIdx) => {
            const cellId = catIdx + "-" + val;
            
            if (gameBoardState[cellId]) {
                // Cella già risolta
                gridCells += `<div class="bg-slate-950/80 border border-slate-900 flex items-center justify-center min-h-[55px] text-slate-700 font-bold text-sm">❌</div>`;
            } else {
                if (!isMyTurn) {
                    // Cella disabilitata (Turno altrui)
                    gridCells += `
                    <div class="bg-slate-800/20 border border-slate-800 text-slate-600 font-black text-xl flex items-center justify-center min-h-[55px] opacity-50 cursor-not-allowed">
                        ${val}€
                    </div>`;
                } else {
                    // Cella interattiva sbloccata (Tuo Turno)
                    gridCells += `
                    <button onclick="window.launchQuestion(${catIdx}, ${val})" class="bg-blue-950/40 border border-slate-800 hover:bg-blue-600 hover:text-white text-yellow-400 font-black text-xl tracking-wide transition duration-150 flex items-center justify-center min-h-[55px]">
                        ${val}€
                    </button>`;
                }
            }
        });
    });

    app.innerHTML = `
    <div class="w-full space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800 gap-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow w-full">
                ${playersHtml}
            </div>
            <div class="bg-blue-950/30 border border-blue-500/20 px-4 py-3 rounded-xl text-center md:text-right shrink-0">
                <span class="text-sm font-bold text-blue-400">Età Media: ${averageAge} anni</span>
            </div>
        </div>

        <div class="overflow-x-auto bg-slate-900/30 p-2 rounded-2xl border border-slate-800/50">
            <div class="grid grid-cols-10 gap-1 min-w-[1000px]">
                ${gridHeaders}
                ${gridCells}
            </div>
        </div>
    </div>`;
}

/**
 * Mostra il podio e la classifica finale con statistiche di accuratezza
 */
export function renderEndGameScreen(players) {
    const app = document.getElementById('app');
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    
    let leaderboardHtml = sorted.map((p, idx) => `
        <div class="bg-slate-950/80 border ${idx === 0 ? 'border-yellow-400 shadow-md shadow-yellow-400/10' : 'border-slate-800'} p-4 rounded-2xl flex justify-between items-center transition-all">
            <div class="text-left">
                <span class="font-bold text-xs text-slate-500 mr-1.5">#${idx + 1}</span>
                <span class="font-black text-base uppercase ${idx === 0 ? 'text-yellow-400 font-black' : 'text-white'}">${p.name}</span>
                <div class="text-[11px] text-slate-400 mt-1 flex gap-2">
                    <span>Esatte: <strong class="text-green-400 font-bold">${p.correct} ✅</strong></span>
                    <span class="text-slate-700">-</span>
                    <span>Errate: <strong class="text-red-400 font-bold">${p.wrong} ❌</strong></span>
                </div>
            </div>
            <div class="text-xl font-black ${p.score >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${p.score} €
            </div>
        </div>
    `).join('');

    app.innerHTML = `
    <div class="relative w-full max-w-xl bg-slate-900 border-4 border-yellow-500 p-8 rounded-3xl shadow-2xl neon-border text-center overflow-hidden animate-pop">
        
        <div class="absolute inset-0 pointer-events-none z-0 opacity-40">
            <div class="absolute top-8 left-12 w-36 h-36 rounded-full fwork-1"></div>
            <div class="absolute top-28 right-10 w-44 h-44 rounded-full fwork-2"></div>
            <div class="absolute bottom-10 left-1/4 w-40 h-40 rounded-full fwork-3"></div>
        </div>

        <div class="relative z-10 space-y-6">
            <div>
                <span class="text-xs font-black text-yellow-400 uppercase tracking-widest block mb-1">✨ MATCH COMPLETATO ✨</span>
                <h1 class="text-3xl font-black text-white tracking-wide uppercase">CLASSIFICA FINALE</h1>
            </div>

            <div class="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">👑 CAMPIONE ASSOLUTO 👑</span>
                <h2 class="text-4xl font-black text-yellow-400 uppercase tracking-widest neon-text mb-6 animate-pulse">${winner.name}</h2>
                
                <div class="space-y-3">
                    ${leaderboardHtml}
                </div>
            </div>

            <button onclick="window.location.search=''" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-4 rounded-xl uppercase tracking-wider transition shadow-lg hover:scale-[1.01]">
                🔄 TORNA ALLA SCHERMATA INIZIALE
            </button>
        </div>
    </div>`;
}

// Esposizione per l'esecuzione del motore e sincronizzazioni realtime globali
window.renderSetupScreen = renderSetupScreen;
window.renderLobbyAttesa = renderLobbyAttesa;
window.renderGameBoard = renderGameBoard;
window.renderEndGameScreen = renderEndGameScreen;