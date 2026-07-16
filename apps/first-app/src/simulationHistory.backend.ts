import {
    listDatastoreItems,
    putDatastoreItem,
    type DatastoreItem,
} from '@datadog/action-catalog/dd/apps_datastore';

import type { MatchEvent, MatchSimulation } from './simulation';

const DATASTORE_ID = 'c1240f47-fdbf-4c5a-921b-d51d3038053f';
const SCHEMA_VERSION = 1;
const PAGE_SIZE = 20;

export interface SavedSimulationRun {
    runId: string;
    createdAt: string;
    simulation: MatchSimulation;
}

export interface SimulationHistoryPage {
    runs: SavedSimulationRun[];
    nextOffset?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTeam(value: unknown): value is MatchSimulation['winner'] {
    return value === 'argentina' || value === 'spain';
}

function isMatchEvent(value: unknown): value is MatchEvent {
    if (!isRecord(value)) return false;
    return (
        typeof value.id === 'string' &&
        typeof value.minute === 'number' &&
        (value.kind === 'goal' || value.kind === 'card') &&
        isTeam(value.team) &&
        typeof value.player === 'string' &&
        (value.assist === undefined || typeof value.assist === 'string')
    );
}

function validateSimulation(value: unknown): MatchSimulation {
    if (!isRecord(value)) throw new Error('Simulation payload must be an object.');
    const events = value.events;
    if (
        typeof value.seed !== 'number' ||
        typeof value.argentinaGoals !== 'number' ||
        typeof value.spainGoals !== 'number' ||
        typeof value.wentToExtraTime !== 'boolean' ||
        !isTeam(value.winner) ||
        !Array.isArray(events) ||
        !events.every(isMatchEvent) ||
        (value.argentinaPenalties !== undefined && typeof value.argentinaPenalties !== 'number') ||
        (value.spainPenalties !== undefined && typeof value.spainPenalties !== 'number')
    ) {
        throw new Error('Simulation payload failed validation.');
    }

    return {
        seed: value.seed,
        argentinaGoals: value.argentinaGoals,
        spainGoals: value.spainGoals,
        argentinaPenalties: value.argentinaPenalties,
        spainPenalties: value.spainPenalties,
        wentToExtraTime: value.wentToExtraTime,
        winner: value.winner,
        events,
    };
}

function readNumber(item: DatastoreItem, key: string): number {
    const value = item[key];
    if (typeof value !== 'number') throw new Error(`Invalid ${key} in saved simulation.`);
    return value;
}

function readOptionalNumber(item: DatastoreItem, key: string): number | undefined {
    const value = item[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'number') throw new Error(`Invalid ${key} in saved simulation.`);
    return value;
}

function deserializeRun(item: DatastoreItem): SavedSimulationRun | undefined {
    try {
        if (
            item.schema_version !== SCHEMA_VERSION ||
            typeof item.run_id !== 'string' ||
            typeof item.created_at !== 'string' ||
            typeof item.went_to_extra_time !== 'boolean' ||
            !isTeam(item.winner) ||
            typeof item.events_json !== 'string'
        ) {
            return undefined;
        }

        const events: unknown = JSON.parse(item.events_json);
        const simulation = validateSimulation({
            seed: readNumber(item, 'seed'),
            argentinaGoals: readNumber(item, 'argentina_goals'),
            spainGoals: readNumber(item, 'spain_goals'),
            argentinaPenalties: readOptionalNumber(item, 'argentina_penalties'),
            spainPenalties: readOptionalNumber(item, 'spain_penalties'),
            wentToExtraTime: item.went_to_extra_time,
            winner: item.winner,
            events,
        });

        return { runId: item.run_id, createdAt: item.created_at, simulation };
    } catch {
        return undefined;
    }
}

export async function saveSimulationRun(input: unknown): Promise<SavedSimulationRun> {
    const simulation = validateSimulation(input);
    const runId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await putDatastoreItem({
        inputs: {
            datastoreId: DATASTORE_ID,
            overwrite: false,
            item: {
                run_id: runId,
                schema_version: SCHEMA_VERSION,
                created_at: createdAt,
                seed: simulation.seed,
                argentina_goals: simulation.argentinaGoals,
                spain_goals: simulation.spainGoals,
                argentina_penalties: simulation.argentinaPenalties ?? null,
                spain_penalties: simulation.spainPenalties ?? null,
                went_to_extra_time: simulation.wentToExtraTime,
                winner: simulation.winner,
                events_json: JSON.stringify(simulation.events),
            },
        },
    });

    return { runId, createdAt, simulation };
}

export async function listSimulationHistory(offset = 0): Promise<SimulationHistoryPage> {
    const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.trunc(offset)) : 0;
    const response = await listDatastoreItems({
        inputs: {
            datastoreId: DATASTORE_ID,
            limit: PAGE_SIZE + 1,
            offset: safeOffset,
            sort: '-createdTime',
        },
    });
    const validRuns = response.items.map(deserializeRun).filter((run): run is SavedSimulationRun => run !== undefined);
    const hasMore = response.items.length > PAGE_SIZE;

    return {
        runs: validRuns.slice(0, PAGE_SIZE),
        nextOffset: hasMore ? safeOffset + PAGE_SIZE : undefined,
    };
}
