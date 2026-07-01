# Je0Pardy! AI - Configurazione Netlify e chiavi sicure

Questo progetto usa Supabase per i dati di gioco e Gemini di Google per generare le domande.

## Proteggere le chiavi

### 1. Non mettere chiavi private nel repository
- `js/chiavi.js` non deve essere committato.
- Il file è già incluso in `.gitignore`.
- Se hai già committato chiavi sensibili in passato, rigenera le chiavi su Gemini.

### 2. Usa una Netlify Function per Gemini
- Il progetto ora include `netlify/functions/gemini.js`.
- Il browser chiama `/api/gemini` invece dell'endpoint Gemini direttamente.
- Le chiavi Gemini vengono lette dal server Netlify tramite variabili d'ambiente.

### 3. Configurare le variabili d'ambiente su Netlify
Nella dashboard del tuo sito Netlify, aggiungi questa variabile:

- `GEMINI_KEYS`

Valore consigliato:

```
AQ.Xxxx...,AQ.Yyyy...
```

Ogni chiave separata da una virgola.

### 4. Cosa deve restare nel repo
- `netlify.toml`
- `netlify/functions/gemini.js`
- Tutti i file JS/HTML/CSS del client
- `.gitignore` con `chiavi.js`

### 5. Cosa puoi rimuovere o non usare più
- `chiavi.js` locale: non è più necessario per Gemini
- `js/chiavi.example.js` può rimanere come esempio, ma non contiene chiavi sensibili

### 6. Deploy
- Assicurati che il branch sia aggiornato su GitHub
- Netlify costruisce il sito dalla root del repo
- `netlify.toml` instrada `/api/gemini` sulla funzione serverless

### 7. Verifiche rapide
- Il browser non deve più importare `chiavi.js` in `index.html`
- `js/api.js` deve chiamare `/api/gemini`
- Le risposte Gemini arrivano dal proxy `/api/gemini`

Se vuoi, posso anche aggiungere un breve script di test locale per verificare la funzione Netlify con `netlify dev`. 