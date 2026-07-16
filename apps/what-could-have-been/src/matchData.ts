import type { AvailabilityNote, MatchForecast, TeamProjection } from '@all-the-apps/simulation';

const player = (id: string, name: string, number: number, role: 'GK' | 'DEF' | 'MID' | 'FWD', goalWeight: number, assistWeight: number, cardWeight: number, note?: string) => ({ id, name, shortName: name, number, role, goalWeight, assistWeight, cardWeight, note });

const teams: [TeamProjection, TeamProjection] = [
  { id: 'france', name: 'France', code: 'FRA', flag: '🇫🇷', formation: '4–2–3–1', color: '#6fa8ff', expectedGoals: 1.52, expectedCards: 1.78, penaltyConversion: .78, players: [player('fra-maignan','Maignan',16,'GK',.01,.03,.16), player('fra-gusto','Gusto',2,'DEF',.18,.58,.7), player('fra-upamecano','Upamecano',4,'DEF',.2,.12,.92), player('fra-lacroix','Lacroix',17,'DEF',.15,.1,.78), player('fra-digne','Digne',3,'DEF',.19,.74,.64), player('fra-tchouameni','Tchouaméni',8,'MID',.36,.45,1.08), player('fra-rabiot','Rabiot',14,'MID',.58,.62,.92), player('fra-olise','Olise',20,'MID',1.02,1.42,.24), player('fra-doue','Doué',11,'MID',.92,1.12,.3), player('fra-barcola','Barcola',25,'MID',.96,.94,.2), player('fra-mbappe','Mbappé',10,'FWD',1.75,1.12,.12,'Captain')] },
  { id: 'argentina', name: 'Argentina', code: 'ARG', flag: '🇦🇷', formation: '4–4–1–1', color: '#8ed8f8', expectedGoals: 1.34, expectedCards: 2.15, penaltyConversion: .77, players: [player('arg-martinez','E. Martínez',23,'GK',.01,.03,.25), player('arg-molina','Molina',26,'DEF',.2,.58,.82), player('arg-romero','Romero',13,'DEF',.23,.14,1.55), player('arg-lisandro','L. Martínez',6,'DEF',.18,.12,1.35), player('arg-tagliafico','Tagliafico',3,'DEF',.14,.36,.94), player('arg-depaul','De Paul',7,'MID',.34,.88,1.18), player('arg-paredes','Paredes',5,'MID',.22,.54,1.42), player('arg-enzo','E. Fernández',24,'MID',.62,.72,.72), player('arg-macallister','Mac Allister',20,'MID',.56,.76,.58), player('arg-messi','Messi',10,'FWD',1.58,1.72,.12,'Captain'), player('arg-alvarez','Álvarez',9,'FWD',1.32,.82,.38)] },
];

const availability: AvailabilityNote[] = [
  { team: 'france', player: 'William Saliba', status: 'Doubt', detail: 'A back problem keeps him doubtful, with Lacroix projected to start.' },
  { team: 'france', player: 'Kylian Mbappé', status: 'Cleared', detail: 'Available to lead the French attack in this alternate final.' },
  { team: 'argentina', player: 'Rodrigo De Paul', status: 'Cleared', detail: 'Projected to return in midfield for the rematch.' },
  { team: 'argentina', player: 'Leonardo Balerdi', status: 'Out', detail: 'A calf injury keeps him outside this projected XI.' },
];

export const forecast: MatchForecast = {
  id: 'world-cup-rematch-france-argentina-2026', brandLabel: 'What Could Have Been', simulationTitle: 'The rematch that never happened', winnerPhrase: 'rewrite the ending', initialSeed: 260720,
  lineupDescription: 'A counterfactual final built from projected knockout-round lineups. These are projections—not confirmed teams.', methodologyDescription: 'Goals use the shared seeded Poisson model. Scorers, assists, and cards are weighted by role and player profile. Each run is illustrative—not betting advice or an official prediction.',
  details: { competition: 'FIFA World Cup 2026 · Alternate final', stageLabel: 'REMATCH', date: 'Sunday, 19 July', time: '3:00 PM ET', venue: 'New York New Jersey Stadium', location: 'East Rutherford, NJ', snapshot: '15 July 2026 · 11:00 PM ET' }, teams, availability,
  sources: [{ label: 'World Cup match schedule', publisher: 'FIFA', url: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums' }, { label: 'France squad reference', publisher: "L'Équipe", url: 'https://www.lequipe.fr/' }, { label: 'Argentina squad reference', publisher: 'FIFA', url: 'https://www.fifa.com/' }],
};
