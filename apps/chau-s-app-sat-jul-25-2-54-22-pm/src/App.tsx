import { useMemo, useState } from 'react';

type Mark = 'X' | 'O';
type Cell = Mark | null;
type Board = Cell[];

const EMPTY_BOARD: Board = Array<Cell>(9).fill(null);
const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
] as const;

function findWinner(board: Board): { mark: Mark; line: readonly number[] } | null {
    for (const line of WINNING_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { mark: board[a] as Mark, line };
        }
    }
    return null;
}

function XMark() {
    return <span className="x-mark" aria-hidden="true"><i /><i /></span>;
}

function OMark() {
    return <span className="o-mark" aria-hidden="true" />;
}

function App() {
    const [board, setBoard] = useState<Board>(EMPTY_BOARD);
    const [turn, setTurn] = useState<Mark>('X');
    const [history, setHistory] = useState<Board[]>([]);
    const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

    const winner = useMemo(() => findWinner(board), [board]);
    const isDraw = !winner && board.every(Boolean);
    const isFinished = Boolean(winner || isDraw);

    const play = (index: number) => {
        if (board[index] || isFinished) return;

        const next = [...board];
        next[index] = turn;
        const nextWinner = findWinner(next);
        const nextDraw = !nextWinner && next.every(Boolean);

        setHistory((current) => [...current, board]);
        setBoard(next);
        if (nextWinner) {
            setScores((current) => ({ ...current, [nextWinner.mark]: current[nextWinner.mark] + 1 }));
        } else if (nextDraw) {
            setScores((current) => ({ ...current, draws: current.draws + 1 }));
        } else {
            setTurn(turn === 'X' ? 'O' : 'X');
        }
    };

    const nextRound = () => {
        setBoard(EMPTY_BOARD);
        setHistory([]);
        setTurn(winner?.mark === 'X' ? 'O' : 'X');
    };

    const undo = () => {
        const previous = history[history.length - 1];
        if (!previous) return;

        if (winner) {
            setScores((current) => ({ ...current, [winner.mark]: Math.max(0, current[winner.mark] - 1) }));
        } else if (isDraw) {
            setScores((current) => ({ ...current, draws: Math.max(0, current.draws - 1) }));
        }

        setBoard(previous);
        setHistory((current) => current.slice(0, -1));
        setTurn(previous.filter(Boolean).length % 2 === 0 ? 'X' : 'O');
    };

    const resetMatch = () => {
        setBoard(EMPTY_BOARD);
        setHistory([]);
        setTurn('X');
        setScores({ X: 0, O: 0, draws: 0 });
    };

    const status = winner ? `${winner.mark} takes the round` : isDraw ? 'Perfect gridlock' : `${turn} to move`;

    return (
        <main className="app-shell">
            <header className="topbar">
                <a className="brand" href="#game" aria-label="Gridlock home">
                    <span className="mini-grid" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</span>
                    <span>GRIDLOCK</span>
                </a>
                <button className="text-button" type="button" onClick={resetMatch}>Reset match</button>
            </header>

            <section className="game-layout" id="game">
                <aside className="intro-panel">
                    <p className="eyebrow"><span>01</span> TWO PLAYERS · ONE GRID</p>
                    <h1>OUTTHINK.<br />OUTPLAY.<br /><em>LINE UP.</em></h1>
                    <p className="lede">The classic game of perfect moves and impossible bluffs. Three in a row takes the round.</p>
                    <div className="turn-key">
                        <span><XMark /> Player one</span>
                        <span><OMark /> Player two</span>
                    </div>
                </aside>

                <section className="board-panel" aria-label="Tic tac toe game">
                    <div className="status-row" aria-live="polite">
                        <span className={`pulse ${isFinished ? 'finished' : ''}`} />
                        <p>{status}</p>
                        <span className="round-count">ROUND {scores.X + scores.O + scores.draws + (isFinished ? 0 : 1)}</span>
                    </div>

                    <div className="board" role="grid" aria-label="Tic tac toe board">
                        {board.map((cell, index) => {
                            const isWinningCell = winner?.line.includes(index) ?? false;
                            return (
                                <button
                                    className={`cell ${cell ? `played ${cell.toLowerCase()}` : ''} ${isWinningCell ? 'winner' : ''}`}
                                    type="button"
                                    role="gridcell"
                                    aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${cell ? `, ${cell}` : ', empty'}`}
                                    disabled={Boolean(cell) || isFinished}
                                    onClick={() => play(index)}
                                    key={index}
                                >
                                    {cell === 'X' ? <XMark /> : cell === 'O' ? <OMark /> : <span className="ghost-mark">{turn}</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="board-actions">
                        <button className="undo-button" type="button" onClick={undo} disabled={!history.length}>
                            <span aria-hidden="true">↶</span> Undo move
                        </button>
                        {isFinished && <button className="next-button" type="button" onClick={nextRound}>Next round <span aria-hidden="true">→</span></button>}
                    </div>
                </section>

                <aside className="score-panel" aria-label="Match score">
                    <p className="eyebrow"><span>02</span> MATCH SCORE</p>
                    <div className={`score-card coral ${turn === 'X' && !isFinished ? 'active' : ''}`}>
                        <div><XMark /><span>PLAYER ONE<small>CROSSES</small></span></div>
                        <strong>{String(scores.X).padStart(2, '0')}</strong>
                    </div>
                    <div className={`score-card blue ${turn === 'O' && !isFinished ? 'active' : ''}`}>
                        <div><OMark /><span>PLAYER TWO<small>NOUGHTS</small></span></div>
                        <strong>{String(scores.O).padStart(2, '0')}</strong>
                    </div>
                    <div className="draw-row"><span>DRAWN ROUNDS</span><strong>{String(scores.draws).padStart(2, '0')}</strong></div>
                    <p className="tip"><b>PRO TIP</b> Control the center, watch the corners, and always think one move ahead.</p>
                </aside>
            </section>

            <footer><span>PLAY FAIR. THINK SHARP.</span><span>THE ORIGINAL 3 × 3</span></footer>
        </main>
    );
}

export default App;
