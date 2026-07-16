import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { availability, matchDetails, sources, teams, type TeamProjection } from './matchData';
import { createSimulation, type MatchEvent } from './simulation';
import {
    listSimulationHistory,
    saveSimulationRun,
    type SavedSimulationRun,
} from './simulationHistory.backend';
import './styles.css';

function TeamMark({ team, compact = false }: { team: TeamProjection; compact?: boolean }) {
    return (
        <div className={`team-mark ${compact ? 'team-mark--compact' : ''}`}>
            <span className="team-mark__flag" aria-hidden="true">{team.flag}</span>
            <div>
                <strong>{team.name}</strong>
                {!compact && <span>{team.formation}</span>}
            </div>
        </div>
    );
}

function Lineup({ team }: { team: TeamProjection }) {
    const groups = [
        { role: 'GK', label: 'Goalkeeper' },
        { role: 'DEF', label: 'Defense' },
        { role: 'MID', label: 'Midfield' },
        { role: 'FWD', label: 'Attack' },
    ] as const;

    return (
        <article className={`lineup lineup--${team.id}`}>
            <header className="lineup__header">
                <TeamMark team={team} />
                <span className="formation-pill">{team.formation}</span>
            </header>
            <div className="lineup__groups">
                {groups.map((group) => (
                    <div className="position-group" key={group.role}>
                        <span className="position-group__label">{group.label}</span>
                        <div className="position-group__players">
                            {team.players.filter((player) => player.role === group.role).map((player) => (
                                <div className="player" key={player.id}>
                                    <span className="player__number">{player.number}</span>
                                    <span className="player__name">{player.shortName}</span>
                                    {player.note && <span className="player__note">{player.note}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}

function TimelineEvent({ event }: { event: MatchEvent }) {
    const team = teams[event.team];
    return (
        <li className="timeline-event">
            <span className="timeline-event__minute">{event.minute}′</span>
            <span className={`event-icon event-icon--${event.kind}`} aria-label={event.kind === 'goal' ? 'Goal' : 'Yellow card'}>
                {event.kind === 'goal' ? '●' : ''}
            </span>
            <div className="timeline-event__copy">
                <strong>{event.player}</strong>
                <span>{event.kind === 'goal' ? (event.assist ? `Goal · assist ${event.assist}` : 'Goal · unassisted') : 'Yellow card'}</span>
            </div>
            <span className="timeline-event__team">{team.flag} {team.code}</span>
        </li>
    );
}

function formatRunTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function HistoryDrawer({
    open,
    onClose,
    onSelect,
    currentSeed,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (run: SavedSimulationRun) => void;
    currentSeed: number;
}) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLElement>(null);
    const historyQuery = useInfiniteQuery({
        queryKey: ['simulation-history'],
        queryFn: ({ pageParam }) => listSimulationHistory(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: open,
    });
    const runs = historyQuery.data?.pages.flatMap((page) => page.runs) ?? [];

    useEffect(() => {
        if (!open) return;
        closeButtonRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab') return;

            const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
            );
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div className="drawer-layer">
            <button className="drawer-backdrop" type="button" aria-label="Close simulation history" onClick={onClose} />
            <aside ref={drawerRef} className="history-drawer" role="dialog" aria-modal="true" aria-labelledby="history-title">
                <header className="history-drawer__header">
                    <div>
                        <span className="kicker">Datastore archive</span>
                        <h2 id="history-title">Simulation runs</h2>
                    </div>
                    <button ref={closeButtonRef} className="drawer-close" type="button" onClick={onClose} aria-label="Close simulation history">×</button>
                </header>

                <div className="history-drawer__body">
                    {historyQuery.isLoading && <div className="history-state">Loading saved runs…</div>}
                    {historyQuery.isError && (
                        <div className="history-state history-state--error">
                            <strong>History is unavailable.</strong>
                            <span>The simulation still works; retry the datastore connection in a moment.</span>
                            <button type="button" onClick={() => void historyQuery.refetch()}>Retry</button>
                        </div>
                    )}
                    {!historyQuery.isLoading && !historyQuery.isError && runs.length === 0 && (
                        <div className="history-state">
                            <strong>No saved runs yet.</strong>
                            <span>Close this panel and run the match to create the first one.</span>
                        </div>
                    )}
                    {runs.length > 0 && (
                        <div className="history-runs">
                            {runs.map((run, index) => {
                                const simulation = run.simulation;
                                const hasPenalties = simulation.argentinaPenalties !== undefined;
                                return (
                                    <button
                                        className={`history-run ${simulation.seed === currentSeed ? 'history-run--active' : ''}`}
                                        type="button"
                                        key={run.runId}
                                        onClick={() => onSelect(run)}
                                    >
                                        <span className="history-run__index">#{String(index + 1).padStart(2, '0')}</span>
                                        <span className="history-run__score">
                                            <span>🇦🇷</span><strong>{simulation.argentinaGoals}</strong>
                                            <i>—</i>
                                            <strong>{simulation.spainGoals}</strong><span>🇪🇸</span>
                                        </span>
                                        <span className="history-run__meta">
                                            <strong>{teams[simulation.winner].name} win{hasPenalties ? ' on pens' : ''}</strong>
                                            <small>{formatRunTime(run.createdAt)} · {simulation.events.length} events</small>
                                        </span>
                                        <span className="history-run__arrow">↗</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {historyQuery.hasNextPage && (
                        <button
                            className="load-more"
                            type="button"
                            disabled={historyQuery.isFetchingNextPage}
                            onClick={() => void historyQuery.fetchNextPage()}
                        >
                            {historyQuery.isFetchingNextPage ? 'Loading…' : 'Load more runs'}
                        </button>
                    )}
                </div>
                <footer className="history-drawer__footer">
                    <span className="live-dot" />
                    Backed by Datadog datastore
                </footer>
            </aside>
        </div>
    );
}

function App() {
    const [run, setRun] = useState(1);
    const [simulation, setSimulation] = useState(() => createSimulation(260719));
    const [historyOpen, setHistoryOpen] = useState(false);
    const [restoredAt, setRestoredAt] = useState<string>();
    const queryClient = useQueryClient();
    const saveMutation = useMutation({
        mutationFn: saveSimulationRun,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulation-history'] }),
    });
    const winner = teams[simulation.winner];
    const hasPenalties = simulation.argentinaPenalties !== undefined && simulation.spainPenalties !== undefined;

    const runSimulation = () => {
        const nextRun = run + 1;
        const nextSimulation = createSimulation(Date.now() + nextRun * 7919);
        setRun(nextRun);
        setRestoredAt(undefined);
        setSimulation(nextSimulation);
        saveMutation.mutate(nextSimulation);
    };

    const closeHistory = useCallback(() => setHistoryOpen(false), []);
    const restoreSimulation = (savedRun: SavedSimulationRun) => {
        setSimulation(savedRun.simulation);
        setRestoredAt(savedRun.createdAt);
        closeHistory();
    };

    return (
        <main className="app-shell">
            <button className="history-tab" type="button" onClick={() => setHistoryOpen(true)} aria-label="Open saved simulation runs">
                <span>Runs</span>
                <strong>↗</strong>
            </button>
            <HistoryDrawer
                open={historyOpen}
                onClose={closeHistory}
                onSelect={restoreSimulation}
                currentSeed={simulation.seed}
            />
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Final XI home">
                    <span className="brand__glyph">XI</span>
                    <span>Final <em>Forecast</em></span>
                </a>
                <div className="topbar__meta">
                    <span className="live-dot" />
                    Projection snapshot · {matchDetails.snapshot}
                </div>
            </header>

            <section className="hero" id="top">
                <div className="hero__eyebrow">{matchDetails.competition}</div>
                <div className="hero__teams" aria-label="Argentina versus Spain">
                    <div className="hero-team hero-team--argentina">
                        <span className="hero-team__code">ARG</span>
                        <span className="hero-team__flag" aria-hidden="true">🇦🇷</span>
                        <h1>Argentina</h1>
                    </div>
                    <div className="versus">
                        <span>versus</span>
                        <strong>FINAL</strong>
                    </div>
                    <div className="hero-team hero-team--spain">
                        <span className="hero-team__code">ESP</span>
                        <span className="hero-team__flag" aria-hidden="true">🇪🇸</span>
                        <h1>Spain</h1>
                    </div>
                </div>
                <div className="match-strip">
                    <div><span>Date</span><strong>{matchDetails.date}</strong></div>
                    <div><span>Kickoff</span><strong>{matchDetails.time}</strong></div>
                    <div><span>Venue</span><strong>{matchDetails.venue}</strong><small>{matchDetails.location}</small></div>
                </div>
            </section>

            <section className="simulation-section" aria-labelledby="simulation-title">
                <div className="section-heading">
                    <div>
                        <span className="kicker">
                            {restoredAt ? `History replay · ${formatRunTime(restoredAt)}` : `Match lab · Run ${run.toString().padStart(2, '0')}`}
                        </span>
                        <h2 id="simulation-title">One possible final</h2>
                    </div>
                    <button className="simulate-button" type="button" onClick={runSimulation}>
                        <span>Run it again</span>
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>

                <div className="simulation-grid">
                    <article className="score-card">
                        <div className="score-card__label">Simulated result</div>
                        <div className="scoreline">
                            <div><span>🇦🇷</span><strong>{simulation.argentinaGoals}</strong><small>ARG</small></div>
                            <span className="scoreline__dash">—</span>
                            <div><span>🇪🇸</span><strong>{simulation.spainGoals}</strong><small>ESP</small></div>
                        </div>
                        {hasPenalties && (
                            <div className="shootout">Penalties · {simulation.argentinaPenalties}–{simulation.spainPenalties}</div>
                        )}
                        <div className="winner-call">
                            <span>{simulation.wentToExtraTime ? (hasPenalties ? 'After penalties' : 'After extra time') : 'After 90 minutes'}</span>
                            <strong>{winner.flag} {winner.name} lift the cup</strong>
                        </div>
                        <div className="model-meter" aria-label="Model baseline expected goals: Argentina 1.34, Spain 1.43">
                            <span style={{ width: '48.4%' }} />
                        </div>
                        <div className="model-meter__labels"><span>ARG 1.34 xG</span><span>ESP 1.43 xG</span></div>
                    </article>

                    <article className="timeline-card">
                        <header>
                            <div>
                                <span className="kicker">Event tape</span>
                                <h3>Goals, assists & cards</h3>
                            </div>
                            <div className="simulation-status">
                                {saveMutation.isPending && <span className="save-status">Saving…</span>}
                                {saveMutation.isSuccess && !restoredAt && <span className="save-status save-status--saved">Saved</span>}
                                {saveMutation.isError && <span className="save-status save-status--error">Not saved</span>}
                                <span className="seed">Seed {simulation.seed.toString().slice(-6)}</span>
                            </div>
                        </header>
                        {simulation.events.length > 0 ? (
                            <ol className="timeline">
                                {simulation.events.map((event) => <TimelineEvent event={event} key={event.id} />)}
                            </ol>
                        ) : (
                            <div className="quiet-match">No goals or cards in this run. A very polite 0–0 still goes to a shootout.</div>
                        )}
                    </article>
                </div>
            </section>

            <section className="lineups-section" aria-labelledby="lineups-title">
                <div className="section-heading section-heading--lineups">
                    <div>
                        <span className="kicker">Selection desk</span>
                        <h2 id="lineups-title">Projected starting XIs</h2>
                    </div>
                    <p>Built from each semifinal XI, recovery time, and the latest availability reporting. These are projections—not confirmed teams.</p>
                </div>
                <div className="lineups-grid">
                    <Lineup team={teams.argentina} />
                    <Lineup team={teams.spain} />
                </div>
            </section>

            <section className="availability-section" aria-labelledby="availability-title">
                <div className="section-heading">
                    <div>
                        <span className="kicker">Medical room</span>
                        <h2 id="availability-title">Availability watch</h2>
                    </div>
                    <span className="updated-pill">Updated {matchDetails.snapshot}</span>
                </div>
                <div className="availability-list">
                    {availability.map((note) => (
                        <article className="availability-row" key={`${note.team}-${note.player}`}>
                            <TeamMark team={teams[note.team]} compact />
                            <div className="availability-row__player">
                                <strong>{note.player}</strong>
                                <span>{note.detail}</span>
                            </div>
                            <span className={`status status--${note.status.toLowerCase()}`}>{note.status}</span>
                        </article>
                    ))}
                </div>
            </section>

            <footer className="methodology">
                <div>
                    <span className="kicker">About this forecast</span>
                    <h2>Weighted, seeded, and intentionally uncertain.</h2>
                    <p>Goals use a Poisson model from a narrow expected-goals baseline. Scorers, assists, and cards are weighted by role and player profile. Each run is illustrative—not betting advice or an official prediction.</p>
                </div>
                <div className="sources">
                    <span className="sources__title">Snapshot sources</span>
                    {sources.map((source) => (
                        <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                            <span>{source.label}</span>
                            <small>{source.publisher} ↗</small>
                        </a>
                    ))}
                </div>
            </footer>
        </main>
    );
}

export default App;
