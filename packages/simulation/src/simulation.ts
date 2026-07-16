import type { MatchEvent, MatchForecast, MatchSimulation, Player, TeamProjection } from './model';

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

function weightedPlayer(
    players: Player[],
    key: 'goalWeight' | 'assistWeight' | 'cardWeight',
    random: Random,
    exclude?: string,
): Player {
    const eligible = players.filter((player) => player.id !== exclude);
    const total = eligible.reduce((sum, player) => sum + player[key], 0);
    let cursor = random() * total;
    for (const player of eligible) {
        cursor -= player[key];
        if (cursor <= 0) return player;
    }
    return eligible[eligible.length - 1];
}

function goalEvents(
    team: TeamProjection,
    count: number,
    random: Random,
    startMinute: number,
    minuteRange: number,
): MatchEvent[] {
    return Array.from({ length: count }, (_, index) => {
        const scorer = weightedPlayer(team.players, 'goalWeight', random);
        const assister = random() < 0.74
            ? weightedPlayer(team.players, 'assistWeight', random, scorer.id)
            : undefined;
        return {
            id: `${team.id}-goal-${startMinute}-${index}`,
            minute: startMinute + Math.floor(random() * minuteRange),
            kind: 'goal' as const,
            team: team.id,
            player: scorer.name,
            assist: assister?.name,
        };
    });
}

function cardEvents(team: TeamProjection, random: Random): MatchEvent[] {
    const count = Math.min(5, poisson(team.expectedCards, random));
    return Array.from({ length: count }, (_, index) => ({
        id: `${team.id}-card-${index}`,
        minute: 8 + Math.floor(random() * 85),
        kind: 'card' as const,
        team: team.id,
        player: weightedPlayer(team.players, 'cardWeight', random).name,
    }));
}

function penaltyShootout(teams: readonly [TeamProjection, TeamProjection], random: Random): Record<string, number> {
    const scores = { [teams[0].id]: 0, [teams[1].id]: 0 };
    for (let round = 0; round < 5; round += 1) {
        for (const team of teams) {
            if (random() < (team.penaltyConversion ?? 0.76)) scores[team.id] += 1;
        }
    }
    while (scores[teams[0].id] === scores[teams[1].id]) {
        for (const team of teams) {
            if (random() < (team.penaltyConversion ?? 0.76)) scores[team.id] += 1;
        }
    }
    return scores;
}

export function createSimulation(forecast: MatchForecast, seed: number): MatchSimulation {
    const normalizedSeed = Math.abs(Math.trunc(seed)) || forecast.initialSeed;
    const random = mulberry32(normalizedSeed);
    const [left, right] = forecast.teams;
    const scores: Record<string, number> = {
        [left.id]: poisson(left.expectedGoals, random),
        [right.id]: poisson(right.expectedGoals, random),
    };
    const events = [
        ...goalEvents(left, scores[left.id], random, 1, 90),
        ...goalEvents(right, scores[right.id], random, 1, 90),
        ...cardEvents(left, random),
        ...cardEvents(right, random),
    ];
    let wentToExtraTime = false;
    let penalties: Record<string, number> | undefined;

    if (scores[left.id] === scores[right.id]) {
        wentToExtraTime = true;
        for (const team of forecast.teams) {
            const extraGoals = poisson(team.expectedGoals / 3.4, random);
            scores[team.id] += extraGoals;
            events.push(...goalEvents(team, extraGoals, random, 91, 30));
        }
        if (scores[left.id] === scores[right.id]) penalties = penaltyShootout(forecast.teams, random);
    }

    const winner = scores[left.id] > scores[right.id] || (
        scores[left.id] === scores[right.id] && (penalties?.[left.id] ?? 0) > (penalties?.[right.id] ?? 0)
    ) ? left.id : right.id;

    return {
        seed: normalizedSeed,
        scores,
        penalties,
        wentToExtraTime,
        winner,
        events: events.sort((a, b) => a.minute - b.minute),
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateSimulation(value: unknown, teamIds: readonly [string, string]): MatchSimulation {
    if (!isRecord(value) || !isRecord(value.scores)) throw new Error('Simulation payload must be an object.');
    const scores = value.scores;
    const validTeam = (team: unknown): team is string => typeof team === 'string' && teamIds.includes(team);
    const events = value.events;
    const penalties = value.penalties;
    const validScores = teamIds.every((team) => typeof scores[team] === 'number');
    const validPenalties = penalties === undefined || (
        isRecord(penalties) && teamIds.every((team) => typeof penalties[team] === 'number')
    );
    const validEvents = Array.isArray(events) && events.every((event) => isRecord(event) &&
        typeof event.id === 'string' && typeof event.minute === 'number' &&
        (event.kind === 'goal' || event.kind === 'card') && validTeam(event.team) &&
        typeof event.player === 'string' && (event.assist === undefined || typeof event.assist === 'string'));

    if (typeof value.seed !== 'number' || !validScores || !validPenalties ||
        typeof value.wentToExtraTime !== 'boolean' || !validTeam(value.winner) || !validEvents) {
        throw new Error('Simulation payload failed validation.');
    }

    return {
        seed: value.seed,
        scores: Object.fromEntries(teamIds.map((team) => [team, scores[team] as number])),
        penalties: penalties === undefined ? undefined : Object.fromEntries(
            teamIds.map((team) => [team, penalties[team] as number]),
        ),
        wentToExtraTime: value.wentToExtraTime,
        winner: value.winner,
        events: events as MatchEvent[],
    };
}
