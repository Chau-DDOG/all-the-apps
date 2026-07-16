export type TeamId = 'argentina' | 'spain';
export type PlayerRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
    id: string;
    name: string;
    shortName: string;
    number: number;
    role: PlayerRole;
    goalWeight: number;
    assistWeight: number;
    cardWeight: number;
    note?: string;
}

export interface TeamProjection {
    id: TeamId;
    name: string;
    code: string;
    flag: string;
    formation: string;
    color: string;
    accent: string;
    expectedGoals: number;
    players: Player[];
}

export interface AvailabilityNote {
    team: TeamId;
    player: string;
    status: 'Out' | 'Doubt' | 'Cleared';
    detail: string;
}

export const matchDetails = {
    competition: 'FIFA World Cup 2026 · Final',
    date: 'Sunday, 19 July',
    time: '3:00 PM ET',
    venue: 'New York New Jersey Stadium',
    location: 'East Rutherford, NJ',
    snapshot: '15 July 2026 · 10:00 PM ET',
};

export const teams: Record<TeamId, TeamProjection> = {
    argentina: {
        id: 'argentina',
        name: 'Argentina',
        code: 'ARG',
        flag: '🇦🇷',
        formation: '4–4–1–1',
        color: '#8ed8f8',
        accent: '#e8f8ff',
        expectedGoals: 1.34,
        players: [
            { id: 'arg-martinez', name: 'Emiliano Martínez', shortName: 'E. Martínez', number: 23, role: 'GK', goalWeight: 0.01, assistWeight: 0.03, cardWeight: 0.25 },
            { id: 'arg-molina', name: 'Nahuel Molina', shortName: 'Molina', number: 26, role: 'DEF', goalWeight: 0.2, assistWeight: 0.58, cardWeight: 0.82 },
            { id: 'arg-romero', name: 'Cristian Romero', shortName: 'Romero', number: 13, role: 'DEF', goalWeight: 0.23, assistWeight: 0.14, cardWeight: 1.55 },
            { id: 'arg-lisandro', name: 'Lisandro Martínez', shortName: 'L. Martínez', number: 6, role: 'DEF', goalWeight: 0.18, assistWeight: 0.12, cardWeight: 1.35 },
            { id: 'arg-tagliafico', name: 'Nicolás Tagliafico', shortName: 'Tagliafico', number: 3, role: 'DEF', goalWeight: 0.14, assistWeight: 0.36, cardWeight: 0.94 },
            { id: 'arg-de-paul', name: 'Rodrigo De Paul', shortName: 'De Paul', number: 7, role: 'MID', goalWeight: 0.34, assistWeight: 0.88, cardWeight: 1.18, note: 'Projected return' },
            { id: 'arg-paredes', name: 'Leandro Paredes', shortName: 'Paredes', number: 5, role: 'MID', goalWeight: 0.22, assistWeight: 0.54, cardWeight: 1.42 },
            { id: 'arg-enzo', name: 'Enzo Fernández', shortName: 'E. Fernández', number: 24, role: 'MID', goalWeight: 0.62, assistWeight: 0.72, cardWeight: 0.72 },
            { id: 'arg-mac-allister', name: 'Alexis Mac Allister', shortName: 'Mac Allister', number: 20, role: 'MID', goalWeight: 0.56, assistWeight: 0.76, cardWeight: 0.58 },
            { id: 'arg-messi', name: 'Lionel Messi', shortName: 'Messi', number: 10, role: 'FWD', goalWeight: 1.58, assistWeight: 1.72, cardWeight: 0.12, note: 'Captain' },
            { id: 'arg-alvarez', name: 'Julián Álvarez', shortName: 'Álvarez', number: 9, role: 'FWD', goalWeight: 1.32, assistWeight: 0.82, cardWeight: 0.38 },
        ],
    },
    spain: {
        id: 'spain',
        name: 'Spain',
        code: 'ESP',
        flag: '🇪🇸',
        formation: '4–3–3',
        color: '#ffcc49',
        accent: '#fff2c7',
        expectedGoals: 1.43,
        players: [
            { id: 'esp-simon', name: 'Unai Simón', shortName: 'Unai Simón', number: 23, role: 'GK', goalWeight: 0.01, assistWeight: 0.03, cardWeight: 0.18 },
            { id: 'esp-llorente', name: 'Marcos Llorente', shortName: 'M. Llorente', number: 18, role: 'DEF', goalWeight: 0.34, assistWeight: 0.62, cardWeight: 0.65, note: 'Projected for Porro' },
            { id: 'esp-cubarsi', name: 'Pau Cubarsí', shortName: 'Cubarsí', number: 4, role: 'DEF', goalWeight: 0.11, assistWeight: 0.16, cardWeight: 0.54 },
            { id: 'esp-laporte', name: 'Aymeric Laporte', shortName: 'Laporte', number: 14, role: 'DEF', goalWeight: 0.23, assistWeight: 0.15, cardWeight: 0.68 },
            { id: 'esp-cucurella', name: 'Marc Cucurella', shortName: 'Cucurella', number: 22, role: 'DEF', goalWeight: 0.14, assistWeight: 0.48, cardWeight: 0.89 },
            { id: 'esp-rodri', name: 'Rodri', shortName: 'Rodri', number: 16, role: 'MID', goalWeight: 0.42, assistWeight: 0.64, cardWeight: 0.81, note: 'Captain' },
            { id: 'esp-fabian', name: 'Fabián Ruiz', shortName: 'Fabián', number: 8, role: 'MID', goalWeight: 0.72, assistWeight: 0.78, cardWeight: 0.48 },
            { id: 'esp-olmo', name: 'Dani Olmo', shortName: 'Olmo', number: 10, role: 'MID', goalWeight: 0.92, assistWeight: 1.08, cardWeight: 0.34 },
            { id: 'esp-yamal', name: 'Lamine Yamal', shortName: 'Yamal', number: 19, role: 'FWD', goalWeight: 1.24, assistWeight: 1.48, cardWeight: 0.17 },
            { id: 'esp-oyarzabal', name: 'Mikel Oyarzabal', shortName: 'Oyarzabal', number: 21, role: 'FWD', goalWeight: 1.34, assistWeight: 0.62, cardWeight: 0.31 },
            { id: 'esp-baena', name: 'Álex Baena', shortName: 'Baena', number: 12, role: 'FWD', goalWeight: 0.72, assistWeight: 0.94, cardWeight: 0.52 },
        ],
    },
};

export const availability: AvailabilityNote[] = [
    {
        team: 'spain',
        player: 'Pedro Porro',
        status: 'Doubt',
        detail: 'Hamstring pull forced him off after 83 minutes in the semifinal; Llorente is the conservative projection.',
    },
    {
        team: 'spain',
        player: 'Nico Williams',
        status: 'Out',
        detail: 'Ongoing muscle issue; omitted from the semifinal starting XI and kept out of this projection.',
    },
    {
        team: 'spain',
        player: 'Aymeric Laporte',
        status: 'Cleared',
        detail: 'Received treatment in the semifinal but completed the match; projected to retain his place.',
    },
    {
        team: 'argentina',
        player: 'Cristian Romero',
        status: 'Cleared',
        detail: 'Earlier knee concern has not prevented him starting through the knockout rounds.',
    },
    {
        team: 'argentina',
        player: 'Leonardo Balerdi',
        status: 'Out',
        detail: 'Withdrew before the tournament with a right calf injury and was replaced by Marcos Senesi.',
    },
];

export const sources = [
    {
        label: 'Argentina semifinal XI',
        publisher: 'Sky Sports',
        url: 'https://www.skysports.com/football/england-vs-argentina/teams/549867',
    },
    {
        label: 'Spain semifinal XI',
        publisher: 'FOX Sports',
        url: 'https://www.foxsports.com/stories/soccer/france-vs-spain-starting-lineups-whos-playing-2026-world-cup-semifinal',
    },
    {
        label: 'Pedro Porro injury update',
        publisher: 'AS',
        url: 'https://as.com/futbol/seleccion/precaucion-con-pedro-porro-f202607-n/',
    },
    {
        label: 'Argentina squad & Balerdi replacement',
        publisher: 'FIFA',
        url: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/leonardo-balerdi-baja-copa-mundial-argentina',
    },
];
