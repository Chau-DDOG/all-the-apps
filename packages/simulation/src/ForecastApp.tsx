import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

import type {
    MatchEvent,
    MatchForecast,
    SavedSimulationRun,
    SimulationPersistence,
    TeamProjection,
} from './model';
import { createSimulation } from './simulation';
import './styles.css';

function TeamMark({ team, compact = false }: { team: TeamProjection; compact?: boolean }) {
    return (
        <div className={`team-mark ${compact ? 'team-mark--compact' : ''}`}>
            <span className="team-mark__flag" aria-hidden="true">{team.flag}</span>
            <div><strong>{team.name}</strong>{!compact && <span>{team.formation}</span>}</div>
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
        <article className="lineup" style={{ '--team-color': team.color } as CSSProperties}>
            <header className="lineup__header"><TeamMark team={team} /><span className="formation-pill">{team.formation}</span></header>
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

function TimelineEvent({ event, teams }: { event: MatchEvent; teams: Record<string, TeamProjection> }) {
    const team = teams[event.team];
    return (
        <li className="timeline-event">
            <span className="timeline-event__minute">{event.minute}′</span>
            <span className={`event-icon event-icon--${event.kind}`} aria-label={event.kind === 'goal' ? 'Goal' : 'Yellow card'}>{event.kind === 'goal' ? '●' : ''}</span>
            <div className="timeline-event__copy"><strong>{event.player}</strong><span>{event.kind === 'goal' ? (event.assist ? `Goal · assist ${event.assist}` : 'Goal · unassisted') : 'Yellow card'}</span></div>
            <span className="timeline-event__team">{team.flag} {team.code}</span>
        </li>
    );
}

function formatRunTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

interface HistoryDrawerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (run: SavedSimulationRun) => void;
    currentSeed: number;
    forecast: MatchForecast;
    persistence: SimulationPersistence;
}

function HistoryDrawer({ open, onClose, onSelect, currentSeed, forecast, persistence }: HistoryDrawerProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLElement>(null);
    const historyQuery = useInfiniteQuery({
        queryKey: ['simulation-history', forecast.id],
        queryFn: ({ pageParam }) => persistence.list(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: open,
    });
    const runs = historyQuery.data?.pages.flatMap((page) => page.runs) ?? [];
    const [left, right] = forecast.teams;
    const teams = Object.fromEntries(forecast.teams.map((team) => [team.id, team]));

    useEffect(() => {
        if (!open) return;
        closeButtonRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab') return;
            const focusable = drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, open]);

    if (!open) return null;
    return (
        <div className="drawer-layer">
            <button className="drawer-backdrop" type="button" aria-label="Close simulation history" onClick={onClose} />
            <aside ref={drawerRef} className="history-drawer" role="dialog" aria-modal="true" aria-labelledby="history-title">
                <header className="history-drawer__header"><div><span className="kicker">Datastore archive</span><h2 id="history-title">Simulation runs</h2></div><button ref={closeButtonRef} className="drawer-close" type="button" onClick={onClose} aria-label="Close simulation history">×</button></header>
                <div className="history-drawer__body">
                    {historyQuery.isLoading && <div className="history-state">Loading saved runs…</div>}
                    {historyQuery.isError && <div className="history-state history-state--error"><strong>History is unavailable.</strong><span>The simulation still works; retry the datastore connection in a moment.</span><button type="button" onClick={() => void historyQuery.refetch()}>Retry</button></div>}
                    {!historyQuery.isLoading && !historyQuery.isError && runs.length === 0 && <div className="history-state"><strong>No saved runs yet.</strong><span>Close this panel and run the match to create the first one.</span></div>}
                    {runs.length > 0 && <div className="history-runs">{runs.map((run, index) => (
                        <button className={`history-run ${run.simulation.seed === currentSeed ? 'history-run--active' : ''}`} type="button" key={run.runId} onClick={() => onSelect(run)}>
                            <span className="history-run__index">#{String(index + 1).padStart(2, '0')}</span>
                            <span className="history-run__score"><span>{left.flag}</span><strong>{run.simulation.scores[left.id]}</strong><i>—</i><strong>{run.simulation.scores[right.id]}</strong><span>{right.flag}</span></span>
                            <span className="history-run__meta"><strong>{teams[run.simulation.winner].name} win{run.simulation.penalties ? ' on pens' : ''}</strong><small>{formatRunTime(run.createdAt)} · {run.simulation.events.length} events</small></span><span className="history-run__arrow">↗</span>
                        </button>
                    ))}</div>}
                    {historyQuery.hasNextPage && <button className="load-more" type="button" disabled={historyQuery.isFetchingNextPage} onClick={() => void historyQuery.fetchNextPage()}>{historyQuery.isFetchingNextPage ? 'Loading…' : 'Load more runs'}</button>}
                </div>
                <footer className="history-drawer__footer"><span className="live-dot" />Backed by this app&apos;s Datadog datastore</footer>
            </aside>
        </div>
    );
}

export function ForecastApp({ forecast, persistence }: { forecast: MatchForecast; persistence: SimulationPersistence }) {
    const [run, setRun] = useState(1);
    const [simulation, setSimulation] = useState(() => createSimulation(forecast, forecast.initialSeed));
    const [historyOpen, setHistoryOpen] = useState(false);
    const [restoredAt, setRestoredAt] = useState<string>();
    const queryClient = useQueryClient();
    const saveMutation = useMutation({ mutationFn: persistence.save, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulation-history', forecast.id] }) });
    const teams = Object.fromEntries(forecast.teams.map((team) => [team.id, team]));
    const [left, right] = forecast.teams;
    const winner = teams[simulation.winner];
    const hasPenalties = simulation.penalties !== undefined;
    const modelShare = `${(left.expectedGoals / (left.expectedGoals + right.expectedGoals)) * 100}%`;

    const runSimulation = () => {
        const nextRun = run + 1;
        const nextSimulation = createSimulation(forecast, Date.now() + nextRun * 7919);
        setRun(nextRun); setRestoredAt(undefined); setSimulation(nextSimulation); saveMutation.mutate(nextSimulation);
    };
    const closeHistory = useCallback(() => setHistoryOpen(false), []);
    const restoreSimulation = (savedRun: SavedSimulationRun) => { setSimulation(savedRun.simulation); setRestoredAt(savedRun.createdAt); closeHistory(); };

    return (
        <main className="app-shell">
            <button className="history-tab" type="button" onClick={() => setHistoryOpen(true)} aria-label="Open saved simulation runs"><span>Runs</span><strong>↗</strong></button>
            <HistoryDrawer open={historyOpen} onClose={closeHistory} onSelect={restoreSimulation} currentSeed={simulation.seed} forecast={forecast} persistence={persistence} />
            <header className="topbar"><a className="brand" href="#top" aria-label={`${forecast.brandLabel} home`}><span className="brand__glyph">XI</span><span>{forecast.brandLabel}</span></a><div className="topbar__meta"><span className="live-dot" />Projection snapshot · {forecast.details.snapshot}</div></header>
            <section className="hero" id="top">
                <div className="hero__eyebrow">{forecast.details.competition}</div>
                <div className="hero__teams" aria-label={`${left.name} versus ${right.name}`}>
                    <div className="hero-team" style={{ '--team-color': left.color } as CSSProperties}><span className="hero-team__code">{left.code}</span><span className="hero-team__flag" aria-hidden="true">{left.flag}</span><h1>{left.name}</h1></div>
                    <div className="versus"><span>versus</span><strong>{forecast.details.stageLabel}</strong></div>
                    <div className="hero-team" style={{ '--team-color': right.color } as CSSProperties}><span className="hero-team__code">{right.code}</span><span className="hero-team__flag" aria-hidden="true">{right.flag}</span><h1>{right.name}</h1></div>
                </div>
                <div className="match-strip"><div><span>Date</span><strong>{forecast.details.date}</strong></div><div><span>Kickoff</span><strong>{forecast.details.time}</strong></div><div><span>Venue</span><strong>{forecast.details.venue}</strong><small>{forecast.details.location}</small></div></div>
            </section>
            <section className="simulation-section" aria-labelledby="simulation-title">
                <div className="section-heading"><div><span className="kicker">{restoredAt ? `History replay · ${formatRunTime(restoredAt)}` : `Match lab · Run ${run.toString().padStart(2, '0')}`}</span><h2 id="simulation-title">{forecast.simulationTitle}</h2></div><button className="simulate-button" type="button" onClick={runSimulation}><span>Run it again</span><span aria-hidden="true">↗</span></button></div>
                <div className="simulation-grid">
                    <article className="score-card"><div className="score-card__label">Simulated result</div><div className="scoreline"><div><span>{left.flag}</span><strong>{simulation.scores[left.id]}</strong><small>{left.code}</small></div><span className="scoreline__dash">—</span><div><span>{right.flag}</span><strong>{simulation.scores[right.id]}</strong><small>{right.code}</small></div></div>
                        {hasPenalties && <div className="shootout">Penalties · {simulation.penalties?.[left.id]}–{simulation.penalties?.[right.id]}</div>}
                        <div className="winner-call"><span>{simulation.wentToExtraTime ? (hasPenalties ? 'After penalties' : 'After extra time') : 'After 90 minutes'}</span><strong>{winner.flag} {winner.name} {forecast.winnerPhrase}</strong></div>
                        <div className="model-meter" aria-label={`Model baseline expected goals: ${left.name} ${left.expectedGoals}, ${right.name} ${right.expectedGoals}`}><span style={{ width: modelShare, background: left.color }} /></div><div className="model-meter__labels"><span>{left.code} {left.expectedGoals} xG</span><span>{right.code} {right.expectedGoals} xG</span></div>
                    </article>
                    <article className="timeline-card"><header><div><span className="kicker">Event tape</span><h3>Goals, assists & cards</h3></div><div className="simulation-status">{saveMutation.isPending && <span className="save-status">Saving…</span>}{saveMutation.isSuccess && !restoredAt && <span className="save-status save-status--saved">Saved</span>}{saveMutation.isError && <span className="save-status save-status--error">Not saved</span>}<span className="seed">Seed {simulation.seed.toString().slice(-6)}</span></div></header>
                        {simulation.events.length > 0 ? <ol className="timeline">{simulation.events.map((event) => <TimelineEvent event={event} teams={teams} key={event.id} />)}</ol> : <div className="quiet-match">No goals or cards in this run. A very polite 0–0 still goes to a shootout.</div>}
                    </article>
                </div>
            </section>
            <section className="lineups-section" aria-labelledby="lineups-title"><div className="section-heading section-heading--lineups"><div><span className="kicker">Selection desk</span><h2 id="lineups-title">Projected starting XIs</h2></div><p>{forecast.lineupDescription}</p></div><div className="lineups-grid"><Lineup team={left} /><Lineup team={right} /></div></section>
            <section className="availability-section" aria-labelledby="availability-title"><div className="section-heading"><div><span className="kicker">Medical room</span><h2 id="availability-title">Availability watch</h2></div><span className="updated-pill">Updated {forecast.details.snapshot}</span></div><div className="availability-list">{forecast.availability.map((note) => <article className="availability-row" key={`${note.team}-${note.player}`}><TeamMark team={teams[note.team]} compact /><div className="availability-row__player"><strong>{note.player}</strong><span>{note.detail}</span></div><span className={`status status--${note.status.toLowerCase()}`}>{note.status}</span></article>)}</div></section>
            <footer className="methodology"><div><span className="kicker">About this forecast</span><h2>Weighted, seeded, and intentionally uncertain.</h2><p>{forecast.methodologyDescription}</p></div><div className="sources"><span className="sources__title">Snapshot sources</span>{forecast.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.label}</span><small>{source.publisher} ↗</small></a>)}</div></footer>
        </main>
    );
}
