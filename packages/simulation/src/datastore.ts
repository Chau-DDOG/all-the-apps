import {
    listDatastoreItems,
    putDatastoreItem,
    type DatastoreItem,
} from '@datadog/action-catalog/dd/apps_datastore';

import type { MatchSimulation, SavedSimulationRun, SimulationHistoryPage } from './model';
import { validateSimulation } from './simulation';

interface LegacyColumns {
    leftGoals: string;
    rightGoals: string;
    leftPenalties: string;
    rightPenalties: string;
}

interface DatastoreHistoryConfig {
    datastoreId: string;
    teamIds: readonly [string, string];
    legacyColumns?: LegacyColumns;
}

const SCHEMA_VERSION = 2;
const PAGE_SIZE = 20;

function readJson(value: unknown): unknown {
    if (typeof value !== 'string') throw new Error('Saved JSON field is invalid.');
    return JSON.parse(value) as unknown;
}

function readLegacySimulation(
    item: DatastoreItem,
    teamIds: readonly [string, string],
    columns: LegacyColumns,
): MatchSimulation {
    const [left, right] = teamIds;
    const leftPenalty = item[columns.leftPenalties];
    const rightPenalty = item[columns.rightPenalties];
    return validateSimulation({
        seed: item.seed,
        scores: { [left]: item[columns.leftGoals], [right]: item[columns.rightGoals] },
        penalties: leftPenalty === null || leftPenalty === undefined ? undefined : {
            [left]: leftPenalty,
            [right]: rightPenalty,
        },
        wentToExtraTime: item.went_to_extra_time,
        winner: item.winner,
        events: readJson(item.events_json),
    }, teamIds);
}

export function createDatastoreHistory(config: DatastoreHistoryConfig): {
    save: (input: unknown) => Promise<SavedSimulationRun>;
    list: (offset?: number) => Promise<SimulationHistoryPage>;
} {
    const deserialize = (item: DatastoreItem): SavedSimulationRun | undefined => {
        try {
            if (typeof item.run_id !== 'string' || typeof item.created_at !== 'string') return undefined;
            const simulation = item.schema_version === SCHEMA_VERSION
                ? validateSimulation({
                    seed: item.seed,
                    scores: readJson(item.scores_json),
                    penalties: item.penalties_json ? readJson(item.penalties_json) : undefined,
                    wentToExtraTime: item.went_to_extra_time,
                    winner: item.winner,
                    events: readJson(item.events_json),
                }, config.teamIds)
                : config.legacyColumns
                    ? readLegacySimulation(item, config.teamIds, config.legacyColumns)
                    : undefined;
            return simulation ? { runId: item.run_id, createdAt: item.created_at, simulation } : undefined;
        } catch {
            return undefined;
        }
    };

    return {
        async save(input: unknown): Promise<SavedSimulationRun> {
            const simulation = validateSimulation(input, config.teamIds);
            const runId = crypto.randomUUID();
            const createdAt = new Date().toISOString();
            await putDatastoreItem({
                inputs: {
                    datastoreId: config.datastoreId,
                    overwrite: false,
                    item: {
                        run_id: runId,
                        schema_version: SCHEMA_VERSION,
                        created_at: createdAt,
                        seed: simulation.seed,
                        scores_json: JSON.stringify(simulation.scores),
                        penalties_json: simulation.penalties ? JSON.stringify(simulation.penalties) : null,
                        went_to_extra_time: simulation.wentToExtraTime,
                        winner: simulation.winner,
                        events_json: JSON.stringify(simulation.events),
                    },
                },
            });
            return { runId, createdAt, simulation };
        },

        async list(offset = 0): Promise<SimulationHistoryPage> {
            const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.trunc(offset)) : 0;
            const response = await listDatastoreItems({
                inputs: {
                    datastoreId: config.datastoreId,
                    limit: PAGE_SIZE + 1,
                    offset: safeOffset,
                    sort: '-createdTime',
                },
            });
            const runs = response.items.map(deserialize).filter((run): run is SavedSimulationRun => run !== undefined);
            return {
                runs: runs.slice(0, PAGE_SIZE),
                nextOffset: response.items.length > PAGE_SIZE ? safeOffset + PAGE_SIZE : undefined,
            };
        },
    };
}
