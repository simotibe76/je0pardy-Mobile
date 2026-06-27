// js/ui.js

/**
 * Mostra la schermata di configurazione iniziale (Creatore o Ospite)
 */
export function renderSetupScreen(currentRoomId, nomeGiocatoreLocale) {
    const app = document.getElementById('app');
    
    if (!currentRoomId) {
        // SCHERMATA CREATORE
        app.innerHTML = `
        <div class="w-full max-w-2xl bg-slate-900 border-4 border-yellow-400 p-8 rounded-3xl shadow-2xl text-center">
            <h1 class="text-5xl font-black text-yellow-400 mb-8 tracking-widest">JE0PARDY! CLOUD</h1>
            <input id="creatore-nome" type="text" class="w-full p-4 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold placeholder-slate-400 border border-slate-700" placeholder="Master" value="Master" />
            <input id="creatore-eta" type="number" class="w-full p-4 mb-6 bg-slate-800 text-white rounded-xl text-center font-bold placeholder-slate-400 border border-slate-700" placeholder="La tua età" />
            <button onclick="window.creaNuovaStanzaCloud()" class="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 p-5 rounded-xl font-black uppercase transition text-lg tracking-wide">Crea Nuova Stanza</button>
        </div>`;
    } else if (currentRoomId && !nomeGiocatoreLocale) {
        // SCHERMATA GUEST
        app.innerHTML = `
        <div class="w-full max-w-2xl bg-slate-900 border-4 border-blue-400 p-8 rounded-3xl shadow-2xl text-center">
            <h1 class="text-5xl font-black text-blue-400 mb-8 tracking-widest">UNISCITI ALLA STANZA</h1>
            <input id="ospite-nome" type="text" class="w-full p-4 mb-4 bg-slate-800 text-white rounded-xl text-center font-bold placeholder-slate-400 border border-slate-700" placeholder="Il tuo nome" />
            <input id="ospite-eta" type="number" class="w-full p-4 mb-6 bg-slate-800 text-white rounded-xl text-center font-bold placeholder-slate-400 border border-slate-700" placeholder="La tua età" />
            <button onclick="window.uniscitiAStanzaCloud()" class="w-full bg-blue-500 hover:bg-blue-400 text-white p-5 rounded-xl font-black uppercase transition text-lg tracking-wide">Entra nel Gioco</button>
        </div>`;
    }
}

/**
 * Renderizza la sala d'attesa prima dell'avvio della partita
 */
export function renderLobbyAttesa(players, nomeGiocatoreLocale, currentRoomId) {
    const app = document.getElementById('app');
    players = Array.isArray(players) ? players : [];
    const isCreatore = players.length > 0 && players[0].name === nomeGiocatoreLocale;
    
    const giocatoriHtml = players.map((p, idx) => `
        <span class="px-6 py-3 bg-transparent border-2 ${idx === 0 ? 'border-yellow-400 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-300'} rounded-full text-sm font-bold m-2 inline-block">
            ${p.name}
        </span>
    `).join('');

    app.innerHTML = `
    <div class="w-full max-w-2xl bg-slate-900 border-4 border-green-400 p-8 rounded-3xl shadow-2xl text-center">
        <h1 class="text-5xl font-black text-green-400 mb-2 tracking-widest">LOBBY D'ATTESA</h1>
        <p class="text-slate-400 mb-8 text-sm font-mono">ID: ${currentRoomId}</p>
        
        <div class="p-6 bg-slate-950 rounded-xl border border-slate-800 mb-8">
            <p class="text-sm text-slate-400 mb-6 uppercase tracking-widest font-bold">Giocatori Connessi</p>
            <div class="flex flex-wrap justify-center gap-3">${giocatoriHtml}</div>
        </div>

        ${isCreatore ? 
            `<button onclick="window.avviaPartitaCloud()" class="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 p-5 rounded-xl font-black uppercase transition text-lg tracking-wide shadow-lg">🚀 Inizia Partita</button>` 
            : 
            `<div class="p-5 rounded-xl border-2 border-green-400/50 bg-green-400/10 text-green-400 font-bold uppercase tracking-wide">In attesa che il creatore avvii la partita... ⏳</div>`
        }
    </div>`;
}

/**
 * Disegna il tabellone principale di gioco a 10 colonne (Categorie + Celle Valori)
 */
export function renderGameBoard(players, gameBoardState, averageAge, nomeGiocatoreLocale, turnoDi) {
    const app = document.getElementById('app');
    const aiCategories = Array.isArray(window.aiCategories) ? window.aiCategories : [];
    const valoriTabellone = Array.isArray(window.valoriTabellone) ? window.valoriTabellone : [];
    players = Array.isArray(players) ? players : [];
    gameBoardState = typeof gameBoardState === 'object' && gameBoardState !== null ? gameBoardState : {};
    
    const numeroTotaleCelle = aiCategories.length * valoriTabellone.length;
    const celleCompletate = Object.keys(gameBoardState).length;
    const isMyTurn = (turnoDi === nomeGiocatoreLocale);

    // Se il tabellone è esaurito, dirotta automaticamente sulla schermata di fine partita
    if (celleCompletate >= numeroTotaleCelle && numeroTotaleCelle > 0) {
        renderEndGameScreen(players);
        return;
    }

    // Sezione dei punteggi dei giocatori
    let playersHtml = players.map((p, idx) => `
        <div class="flex flex-col items-center p-4 rounded-2xl border-3 transition-all ${p.name === turnoDi ?'border-yellow-400 bg-slate-800' : 'border-slate-700 bg-slate-900'}">
            <span class="text-xs font-bold uppercase tracking-wider ${p.name === turnoDi ?'text-yellow-400' : 'text-slate-400'}">${p.name}</span>
            <span class="text-3xl font-black mt-2 ${p.score >= 0 ? 'text-green-400' : 'text-red-400'}">${p.score} €</span>
        </div>
    `).join('');

    // Intestazioni delle categorie
    let gridHeaders = aiCategories.map(cat => `
        <div class="bg-slate-950 border border-slate-700 p-3 text-center flex items-center justify-center min-h-[60px] rounded-t-lg">
            <span class="text-xs font-black uppercase text-blue-400 tracking-widest">${cat}</span>
        </div>
    `).join('');

    // Generazione della griglia dinamica bilanciata sui turni
    let gridCells = '';
    valoriTabellone.forEach(val => {
        aiCategories.forEach((cat, catIdx) => {
            const cellId = catIdx + "-" + val;
            
            if (gameBoardState[cellId]) {
                // Cella già risolta
                gridCells += `<div class="bg-slate-950 border border-slate-900 flex items-center justify-center min-h-[70px] text-slate-700 font-bold text-lg">❌</div>`;
            } else {
                if (!isMyTurn) {
                    // Cella disabilitata (Turno altrui)
                    gridCells += `
                    <div class="bg-slate-800/40 border border-slate-700 text-slate-500 font-black text-2xl flex items-center justify-center min-h-[70px] opacity-50 cursor-not-allowed">
                        ${val}€
                    </div>`;
                } else {
                    // Cella interattiva sbloccata (Tuo Turno)
                    gridCells += `
                    <button onclick="window.selectQuestion(${catIdx}, ${val})" class="bg-slate-800 border-2 border-blue-500/60 hover:bg-blue-600 hover:text-white hover:border-blue-400 text-yellow-400 font-black text-2xl tracking-wide transition duration-150 flex items-center justify-center min-h-[70px]">
                        ${val}€
                    </button>`;
                }
            }
        });
    });

    app.innerHTML = `
    <div class="w-full space-y-4 p-4">
        <div class="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800 gap-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow w-full">
                ${playersHtml}
            </div>
            <div class="bg-blue-950/50 border-2 border-blue-500/60 px-5 py-4 rounded-xl text-center md:text-right shrink-0">
                <span class="text-sm font-bold text-blue-400 uppercase tracking-wide">Età Media: ${averageAge} anni</span>
            </div>
        </div>

        <div class="overflow-x-auto bg-slate-900/40 p-3 rounded-2xl border border-slate-800/70">
            <div class="grid grid-cols-10 gap-1 min-w-[1200px]">
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

export function renderLoadingScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="w-full max-w-2xl bg-slate-900 border-4 border-slate-700 p-10 rounded-3xl shadow-2xl text-center">
        <h1 class="text-3xl font-black text-slate-200 mb-4">Caricamento stanza...</h1>
        <p class="text-slate-400 mb-6">Sto recuperando i dati del gioco, attendi un attimo.</p>
        <div class="mx-auto h-12 w-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
    </div>`;
}

// Esposizione per l'esecuzione del motore e sincronizzazioni realtime globali
window.renderSetupScreen = renderSetupScreen;
window.renderLobbyAttesa = renderLobbyAttesa;
window.renderGameBoard = renderGameBoard;
window.renderEndGameScreen = renderEndGameScreen;
window.renderLoadingScreen = renderLoadingScreen;