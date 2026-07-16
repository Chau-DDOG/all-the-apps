import { teams, type Player, type TeamId, type TeamProjection } from './matchData';

export interface MatchEvent {
    id: string;
    minute: number;
    kind: 'goal' | 'card';
    team: TeamId;
    player: string;
    assist?: string;
}

export interface MatchSimulation {
    seed: number;
    argentinaGoals: number;
    spainGoals: number;
    argentinaPenalties?: number;
    spainPenalties?: number;
    wentToExtraTime: boolean;
    winner: TeamId;
    events: MatchEvent[];
}

type Random = () => number;

function mulberry32(seed: number): Random {
    return () => {
        let value = (seed += 0x6d2b79f5);
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function poisson(lambda: number, random: Random): number {
    const limit = Math.exp(-lambda);
    let product = 1;
    let count = 0;
    do {
        count += 1;
        product *= random();
    } while (product > limit);
    return count - 1;
}

function weightedPlayer(players: Player[], key: 'goalWeight' | 'assistWeight' | 'cardWeight', random: Random, exclude?: string): Player {
    const eligible = players.filter((player) => player.id !== exclude);
    const total = eligible.reduce((sum, player) => sum + player[key], 0);
    let cursor = random() * total;
    for (const player of eligible) {
        cursor -= player[key];
        if (cursor <= 0) return player;
    }
    return eligible[eligible.length - 1];
}

function goalEvents(team: TeamProjection, count: number, random: Random, startMinute: number, minuteRange: number): MatchEvent[] {
    return Array.from({ length: count }, (_, index) => {
        const scorer = weightedPlayer(team.players, 'goalWeight', random);
        const assisted = random() < 0.74;
        const assister = assisted
            ? weightedPlayer(team.players, 'assistWeight', random, scorer.id)
            : undefined;
        return {
            id: `${team.id}-goal-${startMinute}-${index}`,
            minute: startMinute + Math.floor(random() * minuteRange),
            kind: 'goal',
            team: team.id,
            player: scorer.name,
            assist: assister?.name,
        };
    });
}

function cardEvents(team: TeamProjection, random: Random): MatchEvent[] {
    const count = Math.min(5, poisson(team.id === 'argentina' ? 2.15 : 1.72, random));
    return Array.from({ length: count }, (_, index) => {
        const player = weightedPlayer(team.players, 'cardWeight', random);
        return {
            id: `${team.id}-card-${index}`,
            minute: 8 + Math.floor(random() * 85),
            kind: 'card',
            team: team.id,
            player: player.name,
        };
    });
}

function penaltyShootout(random: Random): { argentina: number; spain: number } {
    let argentina = 0;
    let spain = 0;
    for (let round = 0; round < 5; round += 1) {
        if (random() < 0.77) argentina += 1;
        if (random() < 0.76) spain += 1;
    }
    while (argentina === spain) {
        const argentinaScores = random() < 0.77;
        const spainScores = random() < 0.76;
        if (argentinaScores) argentina += 1;
        if (spainScores) spain += 1;
    }
    return { argentina, spain };
}

export function createSimulation(seed: number): MatchSimulation {
    const normalizedSeed = Math.abs(Math.trunc(seed)) || 260719;
    const random = mulberry32(normalizedSeed);
    let argentinaGoals = poisson(teams.argentina.expectedGoals, random);
    let spainGoals = poisson(teams.spain.expectedGoals, random);
    const events = [
        ...goalEvents(teams.argentina, argentinaGoals, random, 1, 90),
        ...goalEvents(teams.spain, spainGoals, random, 1, 90),
        ...cardEvents(teams.argentina, random),
        ...cardEvents(teams.spain, random),
    ];
    let wentToExtraTime = false;
    let argentinaPenalties: number | undefined;
    let spainPenalties: number | undefined;

    if (argentinaGoals === spainGoals) {
        wentToExtraTime = true;
        const argentinaExtra = poisson(teams.argentina.expectedGoals / 3.4, random);
        const spainExtra = poisson(teams.spain.expectedGoals / 3.4, random);
        argentinaGoals += argentinaExtra;
        spainGoals += spainExtra;
        events.push(...goalEvents(teams.argentina, argentinaExtra, random, 91, 30));
        events.push(...goalEvents(teams.spain, spainExtra, random, 91, 30));

        if (argentinaGoals === spainGoals) {
            const shootout = penaltyShootout(random);
            argentinaPenalties = shootout.argentina;
            spainPenalties = shootout.spain;
        }
    }

    const winner: TeamId = argentinaGoals > spainGoals || (
        argentinaGoals === spainGoals && (argentinaPenalties ?? 0) > (spainPenalties ?? 0)
    ) ? 'argentina' : 'spain';

    return {
        seed: normalizedSeed,
        argentinaGoals,
        spainGoals,
        argentinaPenalties,
        spainPenalties,
        wentToExtraTime,
        winner,
        events: events.sort((a, b) => a.minute - b.minute),
    };
}
