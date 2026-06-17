const aiCategories = [
    "Storia",
    "Geografia",
    "Scienza",
    "Cinema",
    "Musica",
    "Sport",
    "Letteratura",
    "Cucina",
    "Natura",
    "Tecnologia"
];

const valoriTabellone = [
    200,
    400,
    600,
    800,
    1000
];

const DIFFICULTY_LEVELS = {
    200: { level: 1, desc: "Concetto base molto noto e intuitivo." },
    400: { level: 2, desc: "Nozione diffusa o scolastica standard." },
    600: { level: 3, desc: "Richiede buona memoria o ragionamento." },
    800: { level: 4, desc: "Curiosità o dettaglio più settoriale." },
    1000: { level: 5, desc: "Sfida avanzata ed esperta." }
};

const MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
];
