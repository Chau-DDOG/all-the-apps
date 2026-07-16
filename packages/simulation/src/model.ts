export type PlayerRole = 'GK' | 'DEF' | 'MID' | 'FWD';
export type AvailabilityStatus = 'Out' | 'Doubt' | 'Cleared';

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
    id: string;
    name: string;
    code: string;
    flag: string;
    formation: string;
    color: string;
    expectedGoals: number;
    expectedCards: number;
    penaltyConversion?: number;
    players: Player[];
}

export interface AvailabilityNote {
    team: string;
    player: string;
    status: AvailabilityStatus;
    detail: string;
}

export interface ForecastSource {
    label: string;
    publisher: string;
    url: string;
}

export interface MatchDetails {
    competition: string;
    stageLabel: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    snapshot: string;
}

export interface MatchForecast {
    id: string;
    brandLabel: string;
    simulationTitle: string;
    winnerPhrase: string;
    lineupDescription: string;
    methodologyDescription: string;
    initialSeed: number;
    details: MatchDetails;
    teams: readonly [TeamProjection, TeamProjection];
    availability: AvailabilityNote[];
    sources: ForecastSource[];
}

export interface MatchEvent {
    id: string;
    minute: number;
    kind: 'goal' | 'card';
    team: string;
    player: string;
    assist?: string;
}

export interface MatchSimulation {
    seed: number;
    scores: Record<string, number>;
    penalties?: Record<string, number>;
    wentToExtraTime: boolean;
    winner: string;
    events: MatchEvent[];
}

export interface SavedSimulationRun {
    runId: string;
    createdAt: string;
    simulation: MatchSimulation;
}

export interface SimulationHistoryPage {
    runs: SavedSimulationRun[];
    nextOffset?: number;
}

export interface SimulationPersistence {
    save: (simulation: MatchSimulation) => Promise<SavedSimulationRun>;
    list: (offset?: number) => Promise<SimulationHistoryPage>;
}
