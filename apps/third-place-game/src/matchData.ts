import type { AvailabilityNote, MatchForecast, TeamProjection } from '@all-the-apps/simulation';

const teams: Record<'france' | 'england', TeamProjection> = {
    france: {
        id: 'france', name: 'France', code: 'FRA', flag: '🇫🇷', formation: '4–2–3–1',
        color: '#6fa8ff', expectedGoals: 1.52, expectedCards: 1.78, penaltyConversion: 0.78,
        players: [
            { id: 'fra-maignan', name: 'Mike Maignan', shortName: 'Maignan', number: 16, role: 'GK', goalWeight: .01, assistWeight: .03, cardWeight: .16 },
            { id: 'fra-gusto', name: 'Malo Gusto', shortName: 'Gusto', number: 2, role: 'DEF', goalWeight: .18, assistWeight: .58, cardWeight: .7, note: 'Projected rotation' },
            { id: 'fra-upamecano', name: 'Dayot Upamecano', shortName: 'Upamecano', number: 4, role: 'DEF', goalWeight: .2, assistWeight: .12, cardWeight: .92 },
            { id: 'fra-lacroix', name: 'Maxence Lacroix', shortName: 'Lacroix', number: 17, role: 'DEF', goalWeight: .15, assistWeight: .1, cardWeight: .78, note: 'For Saliba' },
            { id: 'fra-digne', name: 'Lucas Digne', shortName: 'Digne', number: 3, role: 'DEF', goalWeight: .19, assistWeight: .74, cardWeight: .64 },
            { id: 'fra-tchouameni', name: 'Aurélien Tchouaméni', shortName: 'Tchouaméni', number: 8, role: 'MID', goalWeight: .36, assistWeight: .45, cardWeight: 1.08 },
            { id: 'fra-rabiot', name: 'Adrien Rabiot', shortName: 'Rabiot', number: 14, role: 'MID', goalWeight: .58, assistWeight: .62, cardWeight: .92 },
            { id: 'fra-olise', name: 'Michael Olise', shortName: 'Olise', number: 20, role: 'MID', goalWeight: 1.02, assistWeight: 1.42, cardWeight: .24 },
            { id: 'fra-doue', name: 'Désiré Doué', shortName: 'Doué', number: 11, role: 'MID', goalWeight: .92, assistWeight: 1.12, cardWeight: .3, note: 'Projected rotation' },
            { id: 'fra-barcola', name: 'Bradley Barcola', shortName: 'Barcola', number: 25, role: 'MID', goalWeight: .96, assistWeight: .94, cardWeight: .2 },
            { id: 'fra-mbappe', name: 'Kylian Mbappé', shortName: 'Mbappé', number: 10, role: 'FWD', goalWeight: 1.75, assistWeight: 1.12, cardWeight: .12, note: 'Captain' },
        ],
    },
    england: {
        id: 'england', name: 'England', code: 'ENG', flag: '🏴', formation: '4–2–3–1',
        color: '#f2f2ee', expectedGoals: 1.39, expectedCards: 1.86, penaltyConversion: 0.76,
        players: [
            { id: 'eng-pickford', name: 'Jordan Pickford', shortName: 'Pickford', number: 1, role: 'GK', goalWeight: .01, assistWeight: .03, cardWeight: .2 },
            { id: 'eng-konsa', name: 'Ezri Konsa', shortName: 'Konsa', number: 2, role: 'DEF', goalWeight: .14, assistWeight: .2, cardWeight: .62, note: 'For James' },
            { id: 'eng-stones', name: 'John Stones', shortName: 'Stones', number: 5, role: 'DEF', goalWeight: .26, assistWeight: .18, cardWeight: .48 },
            { id: 'eng-guehi', name: 'Marc Guéhi', shortName: 'Guéhi', number: 6, role: 'DEF', goalWeight: .23, assistWeight: .16, cardWeight: .72 },
            { id: 'eng-oreilly', name: "Nico O'Reilly", shortName: "O'Reilly", number: 3, role: 'DEF', goalWeight: .28, assistWeight: .58, cardWeight: .66, note: 'Projected rotation' },
            { id: 'eng-rice', name: 'Declan Rice', shortName: 'Rice', number: 4, role: 'MID', goalWeight: .56, assistWeight: .86, cardWeight: .94 },
            { id: 'eng-anderson', name: 'Elliot Anderson', shortName: 'Anderson', number: 8, role: 'MID', goalWeight: .38, assistWeight: .62, cardWeight: 1.15 },
            { id: 'eng-saka', name: 'Bukayo Saka', shortName: 'Saka', number: 7, role: 'MID', goalWeight: 1.24, assistWeight: 1.34, cardWeight: .16, note: 'Projected return' },
            { id: 'eng-bellingham', name: 'Jude Bellingham', shortName: 'Bellingham', number: 10, role: 'MID', goalWeight: 1.26, assistWeight: 1.08, cardWeight: .72 },
            { id: 'eng-gordon', name: 'Anthony Gordon', shortName: 'Gordon', number: 18, role: 'MID', goalWeight: 1.04, assistWeight: .9, cardWeight: .5 },
            { id: 'eng-kane', name: 'Harry Kane', shortName: 'Kane', number: 9, role: 'FWD', goalWeight: 1.7, assistWeight: .86, cardWeight: .24, note: 'Captain' },
        ],
    },
};

const availability: AvailabilityNote[] = [
    { team: 'france', player: 'William Saliba', status: 'Doubt', detail: 'A back problem forced him off after 29 minutes against Spain; Lacroix is projected to start in his place.' },
    { team: 'france', player: 'Maxence Lacroix', status: 'Cleared', detail: 'Replaced Saliba in the semifinal and is the conservative center-back projection.' },
    { team: 'england', player: 'Reece James', status: 'Doubt', detail: 'Received treatment late in the semifinal and came off after 82 minutes; Konsa is projected at right-back.' },
    { team: 'england', player: 'Jordan Henderson', status: 'Out', detail: 'The broken wrist that ruled him out of the semifinal keeps him outside this projected XI.' },
    { team: 'england', player: 'Jarell Quansah', status: 'Cleared', detail: 'His semifinal suspension has been served, though he remains outside this projected starting XI.' },
];

export const forecast: MatchForecast = {
    id: 'world-cup-third-place-2026',
    brandLabel: 'Bronze Forecast',
    simulationTitle: 'One possible playoff',
    winnerPhrase: 'claim third place',
    lineupDescription: 'Built from both semifinal teams with extra rotation weight for the short turnaround. These are projections—not confirmed teams.',
    methodologyDescription: 'Goals use a Poisson model with a slightly more open third-place baseline. Scorers, assists, and cards are weighted by role and player profile. Each run is illustrative—not betting advice or an official prediction.',
    initialSeed: 260718,
    details: {
        competition: 'FIFA World Cup 2026 · Play-off for third place',
        stageLabel: '3RD PLACE',
        date: 'Saturday, 18 July',
        time: '5:00 PM ET',
        venue: 'Miami Stadium',
        location: 'Miami Gardens, FL',
        snapshot: '15 July 2026 · 11:00 PM ET',
    },
    teams: [teams.france, teams.england],
    availability,
    sources: [
        { label: 'World Cup match schedule', publisher: 'FIFA', url: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums' },
        { label: 'France semifinal XI', publisher: "L'Équipe", url: 'https://www.lequipe.fr/Football/Actualites/Barcola-prefere-a-doue-pour-demarrer-face-a-l-espagne-en-demi-finales-de-la-coupe-du-monde/1704273' },
        { label: 'Saliba back injury', publisher: "L'Équipe", url: 'https://www.lequipe.fr/Football/Actualites/William-saliba-sort-sur-blessure-en-demi-finales-de-la-coupe-du-monde-contre-l-espagne/1704366' },
        { label: 'England semifinal XI', publisher: 'Sky Sports', url: 'https://www.skysports.com/football/england-vs-argentina/teams/549867' },
        { label: 'England availability report', publisher: 'Sky Sports', url: 'https://www.skysports.com/football/news/11095/13563231/england-vs-argentina-declan-rice-fit-for-world-cup-semi-final-as-thomas-tuchels-squad-issues-begin-to-ease' },
    ],
};
