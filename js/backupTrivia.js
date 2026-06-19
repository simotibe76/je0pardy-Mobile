const BACKUP_TRIVIA = {
    "Storia": {
        200: [
            { q: "In quale anno è scoppiata la Prima Guerra Mondiale?", a: "1914" },
            { q: "In quale anno è stata scoperta l'America da Cristoforo Colombo?", a: "1492" }
        ],
        400: [
            { q: "Chi era il presidente degli Stati Uniti durante la crisi dei missili di Cuba?", a: "John F. Kennedy" },
            { q: "Chi fu il primo storico presidente degli Stati Uniti d'America?", a: "George Washington" }
        ],
        600: [
            { q: "Quale dinastia regnò in Francia durante la costruzione di Versailles?", a: "Borbone" },
            { q: "Quale imperatore romano fu soprannominato 'Piccolo Stivale'?", a: "Caligola" }
        ],
        800: [
            { q: "In quale anno è avvenuta la celebre Battaglia di Waterloo?", a: "1815" },
            { q: "In quale anno avvenne la caduta dell'Impero Romano d'Occidente?", a: "476" }
        ],
        1000: [
            { q: "Quale trattato pose ufficialmente fine alla Guerra dei Trent'anni nel 1648?", a: "Pace di Vestfalia" },
            { q: "In quale anno venne firmata la Magna Carta in Inghilterra?", a: "1215" }
        ]
    },
    "Geografia": {
        200: [
            { q: "Qual è la capitale della Spagna?", a: "Madrid" },
            { q: "Qual è la capitale della Francia?", a: "Parigi" }
        ],
        400: [
            { q: "Qual è il fiume più lungo del mondo?", a: "Rio delle Amazzoni" },
            { q: "Qual è la catena montuosa più alta del mondo?", a: "Himalaya" }
        ],
        600: [
            { q: "In quale stato americano si trova il Gran Canyon?", a: "Arizona" },
            { q: "Quale grande deserto copre gran parte dell'Africa settentrionale?", a: "Sahara" }
        ],
        800: [
            { q: "Qual è la capitale dell'Australia?", a: "Canberra" },
            { q: "Qual è l'isola più grande del mondo?", a: "Groenlandia" }
        ],
        1000: [
            { q: "Quale stretto separa la Russia dall'Alaska?", a: "Stretto di Bering" },
            { q: "Qual è la nazione più piccola del mondo per superficie?", a: "Città del Vaticano" }
        ]
    },
    "Scienza": {
        200: [
            { q: "Qual è il simbolo chimico dell'Acqua?", a: "H2O" },
            { q: "Qual è il simbolo chimico dell'Oro?", a: "Au" }
        ],
        400: [
            { q: "Quale pianeta del sistema solare è soprannominato il Pianeta Rosso?", a: "Marte" },
            { q: "Qual è il pianeta più grande del nostro sistema solare?", a: "Giove" }
        ],
        600: [
            { q: "Quale scienziato ha enunciato la teoria della relatività generale?", a: "Albert Einstein" },
            { q: "Chi formulò la legge della gravitazione universale vedendo cadere una mela?", a: "Isaac Newton" }
        ],
        800: [
            { q: "Quale organo del corpo umano produce l'insulina?", a: "Pancreas" },
            { q: "Quale organità cellulare è considerata la centrale energetica della cellula?", a: "Mitocondrio" }
        ],
        1000: [
            { q: "Qual è la velocità della luce approssimata in chilometri al secondo?", a: "300.000" },
            { q: "Qual è il primo elemento della tavola periodica degli elementi?", a: "Idrogeno" }
        ]
    },
    "Cinema": {
        200: [
            { q: "Chi ha diretto il film 'Titanic' del 1997?", a: "James Cameron" },
            { q: "Quale famoso archeologo del cinema è interpretato da Harrison Ford?", a: "Indiana Jones" }
        ],
        400: [
            { q: "Quale attore interpreta l'iconico pirata Jack Sparrow?", a: "Johnny Depp" },
            { q: "Chi interpreta il protagonista Neo nella saga di fantascienza 'Matrix'?", a: "Keanu Reeves" }
        ],
        600: [
            { q: "Quanti premi Oscar ha vinto la trilogia del 'Signore degli Anelli'?", a: "17" },
            { q: "Quale attore ha vinto l'Oscar postumo per il ruolo del Joker nel 2009?", a: "Heath Ledger" }
        ],
        800: [
            { q: "Quale regista ha firmato il capolavoro thriller 'Psycho' del 1960?", a: "Alfred Hitchcock" },
            { q: "Quale regista ha diretto i film 'Pulp Fiction' e 'Kill Bill'?", a: "Quentin Tarantino" }
        ],
        1000: [
            { q: "In quale film di fantascienza del 1982 compare per la prima volta il test Voight-Kampff?", a: "Blade Runner" },
            { q: "Quale film del 1941 diretto da Orson Welles è intitolato 'Citizen' in originale?", a: "Quarto Potere" }
        ]
    },
    "Musica": {
        200: [
            { q: "Chi era il frontman della leggendaria band britannica dei Queen?", a: "Freddie Mercury" },
            { q: "Quale cantante pop era soprannominato il Re del Pop?", a: "Michael Jackson" }
        ],
        400: [
            { q: "Quale celebre compositore sordo scrisse la Nona Sinfonia?", a: "Ludwig van Beethoven" },
            { q: "Quale compositore austriaco fu un prodigio e scrisse il 'Flauto Magico'?", a: "Wolfgang Amadeus Mozart" }
        ],
        600: [
            { q: "In quale città italiana è nato il famoso liutaio Antonio Stradivari?", a: "Cremona" },
            { q: "Da quale città inglese provenivano i quattro membri dei Beatles?", a: "Liverpool" }
        ],
        800: [
            { q: "Quale album dei Pink Floyd del 1973 mostra un prisma in copertina?", a: "The Dark Side of the Moon" },
            { q: "Come si chiamava lo storico chitarrista mancino che suonò a Woodstock?", a: "Jimi Hendrix" }
        ],
        1000: [
            { q: "Chi compose l'opera lirica 'Il barbiere di Siviglia'?", a: "Gioachino Rossini" },
            { q: "Quale compositore barocco tedesco ha scritto i Concerti Brandeburghesi?", a: "Johann Sebastian Bach" }
        ]
    },
    "Sport": {
        200: [
            { q: "Quanti giocatori di movimento scendono in campo in una squadra di calcio?", a: "11" },
            { q: "In quale sport si usano racchetta, pallina gialla e una rete a metà campo?", a: "Tennis" }
        ],
        400: [
            { q: "Ogni quanti anni si disputano regolarmente i Giochi Olimpici?", a: "4" },
            { q: "Quanti tempi regolamentari compongono una partita di basket?", a: "4" }
        ],
        600: [
            { q: "Chi detiene il record mondiale dei 100 metri piani con 9,58 secondi?", a: "Usain Bolt" },
            { q: "Quale ciclista italiano era soprannominato 'Il Pirata'?", a: "Marco Pantani" }
        ],
        800: [
            { q: "In quale sport si assegna un celebre anello ai vincitori del campionato?", a: "NBA / Basket" },
            { q: "Quale leggenda dell'automobilismo ha vinto 7 titoli mondiali in Formula 1 con Benetton e Ferrari?", a: "Michael Schumacher" }
        ],
        1000: [
            { q: "Quale nazione ha vinto il primo campionato mondiale di calcio nel 1930?", a: "Uruguay" },
            { q: "In quale città si sono tenute le prime Olimpiadi dell'era moderna nel 1896?", a: "Atene" }
        ]
    },
    "Letteratura": {
        200: [
            { q: "Chi ha scritto la 'Divina Commedia'?", a: "Dante Alighieri" },
            { q: "Chi ha scritto le avventure di Pinocchio?", a: "Carlo Collodi" }
        ],
        400: [
            { q: "Qual è il titolo del celebre romanzo di Alessandro Manzoni ambientato sul lago di Como?", a: "I Promessi Sposi" },
            { q: "Chi è l'investigatore privato britannico creato da Arthur Conan Doyle?", a: "Sherlock Holmes" }
        ],
        600: [
            { q: "Chi è l'autore del dramma teatrale 'Amleto'?", a: "William Shakespeare" },
            { q: "Quale scrittore toscano compose il 'Decameron' nel XIV secolo?", a: "Giovanni Boccaccio" }
        ],
        800: [
            { q: "Quale scrittore francese ha inventato il personaggio del Capitano Nemo?", a: "Jules Verne" },
            { q: "Chi scrisse il monumentale romanzo russo 'Guerra e pace'?", a: "Lev Tolstoj" }
        ],
        1000: [
            { q: "Sotto quale pseudonimo maschile scriveva la scrittrice Mary Ann Evans?", a: "George Eliot" },
            { q: "Quale autore ha scritto la trilogia fantasy 'Il Signore degli Anelli'?", a: "J.R.R. Tolkien" }
        ]
    },
    "Cucina": {
        200: [
            { q: "Qual è l'ingrediente principale della base della pizza margherita?", a: "Farina" },
            { q: "Quale ortaggio rosso è la base per preparare il classico ragù?", a: "Pomodoro" }
        ],
        400: [
            { q: "Quale celebre formaggio a pasta dura DOP è tipico di Parma e Reggio Emilia?", a: "Parmigiano Reggiano" },
            { q: "Quale salsa fredda ligure si prepara pestando basilico, pinoli, aglio e formaggio?", a: "Pesto" }
        ],
        600: [
            { q: "Quale bevanda viene tradizionalmente usata per inzuppare i savoiardi nel Tiramisù?", a: "Caffè" },
            { q: "Quale fungo sotterraneo pregiatissimo e profumato è tipico di Alba?", a: "Tartufo bianco" }
        ],
        800: [
            { q: "Da quale paese proviene originariamente il piatto chiamato Paella?", a: "Spagna" },
            { q: "Da quale paese asiatico proviene il Sushi?", a: "Giappone" }
        ],
        1000: [
            { q: "Quale preziosa spezia derivata da un fiore dona il classico colore giallo al risotto alla milanese?", a: "Zafferano" },
            { q: "Come si chiama la tecnica culinaria francese che consiste nel cuocere immerso nel grasso a bassa temperatura?", a: "Confit" }
        ]
    },
    "Natura": {
        200: [
            { q: "Qual è il mammifero terrestre più grande del mondo?", a: "Elefante africano" },
            { q: "Qual è l'animale più veloce del mondo sulla terraferma?", a: "Ghepardo" }
        ],
        400: [
            { q: "Come viene chiamato il processo con cui le piante trasformano la luce in nutrimento?", a: "Fotosintesi clorofilliana" },
            { q: "Quale insetto laborioso è fondamentale per l'impollinazione e produce il miele?", a: "Ape" }
        ],
        600: [
            { q: "Quale gas compone per circa il 78% l'atmosfera terrestre?", a: "Azoto" },
            { q: "Come viene chiamato lo strato di gas che protegge la Terra dai raggi UV nocivi?", a: "Ozono" }
        ],
        800: [
            { q: "Quale predatore marino è noto scientificamente come Orcinus orca?", a: "Orca" },
            { q: "Quale grande rettile acquatico tropicale appartiene all'ordine Crocodylia?", a: "Coccodrillo" }
        ],
        1000: [
            { q: "Quale tipo di albero detiene il record per essere il più alto del mondo?", a: "Sequoia" },
            { q: "Quale deserto freddo si trova nell'Asia centrale, tra Mongolia e Cina?", a: "Deserto del Gobi" }
        ]
    },
    "Tecnologia": {
        200: [
            { q: "Quale sistema operativo mobile è sviluppato da Google?", a: "Android" },
            { q: "Quale azienda americana ha come logo una mela morsicata?", a: "Apple" }
        ],
        400: [
            { q: "Cosa significa l'acronimo WWW nei siti internet?", a: "World Wide Web" },
            { q: "Cosa significa la 'U' nella tecnologia di memoria USB?", a: "Universal" }
        ],
        600: [
            { q: "In quale decennio è stato inventato e commercializzato il primo microprocessore Intel (4004)?", a: "Anni 70 (1971)" },
            { q: "Quale protocollo wireless a corto raggio prende il nome da un re vichingo?", a: "Bluetooth" }
        ],
        800: [
            { q: "Quale linguaggio di programmazione, nato nel 1991, usa un serpente come simbolo?", a: "Python" },
            { q: "Quale linguaggio, standard del web, si usa insieme a HTML e CSS per dare interattività?", a: "JavaScript" }
        ],
        1000: [
            { q: "Come si chiamava lo storico home computer a 8 bit rilasciato dalla Commodore nel 1982?", a: "Commodore 64" },
            { q: "In quale anno è stato lanciato pubblicamente il primo iPhone rivoluzionando gli smartphone?", a: "2007" }
        ]
    }
};