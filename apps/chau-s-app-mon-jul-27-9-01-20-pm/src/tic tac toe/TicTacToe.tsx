import { useMemo, useState } from "react";

type Player = "X" | "O";
type SquareValue = Player | null;

type GameState = {
  isDraw: boolean;
  winner: Player | null;
  winningLine: number[];
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const playerLabels: Record<Player, string> = {
  X: "Crosses",
  O: "Noughts",
};

function createEmptyBoard() {
  return Array<SquareValue>(9).fill(null);
}

function getNextPlayer(player: Player): Player {
  return player === "X" ? "O" : "X";
}

function getGameState(board: SquareValue[]): GameState {
  for (const line of winningLines) {
    const [firstIndex, secondIndex, thirdIndex] = line;
    const player = board[firstIndex];

    if (
      player &&
      player === board[secondIndex] &&
      player === board[thirdIndex]
    ) {
      return {
        isDraw: false,
        winner: player,
        winningLine: line,
      };
    }
  }

  return {
    isDraw: board.every(Boolean),
    winner: null,
    winningLine: [],
  };
}

function getStatusText(gameState: GameState, currentPlayer: Player) {
  if (gameState.winner) {
    return `${playerLabels[gameState.winner]} win the round!`;
  }

  if (gameState.isDraw) {
    return "Board full. This round is a draw.";
  }

  return `${playerLabels[currentPlayer]}' turn`;
}

function TicTacToeGame() {
  const [board, setBoard] = useState<SquareValue[]>(() => createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState<Record<Player, number>>({ O: 0, X: 0 });
  const [draws, setDraws] = useState(0);

  const gameState = useMemo(() => getGameState(board), [board]);
  const statusText = getStatusText(gameState, currentPlayer);
  const isRoundOver = Boolean(gameState.winner) || gameState.isDraw;

  const playSquare = (index: number) => {
    if (board[index] || isRoundOver) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    const nextGameState = getGameState(nextBoard);

    setBoard(nextBoard);

    if (nextGameState.winner) {
      setScores((currentScores) => ({
        ...currentScores,
        [nextGameState.winner as Player]:
          currentScores[nextGameState.winner as Player] + 1,
      }));
      return;
    }

    if (nextGameState.isDraw) {
      setDraws((currentDraws) => currentDraws + 1);
      return;
    }

    setCurrentPlayer(getNextPlayer(currentPlayer));
  };

  const startNextRound = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(round % 2 === 0 ? "X" : "O");
    setRound((currentRound) => currentRound + 1);
  };

  const resetMatch = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("X");
    setDraws(0);
    setRound(1);
    setScores({ O: 0, X: 0 });
  };

  return (
    <main className="tic-tac-toe">
      <div className="game-shell">
        <section className="game-intro" aria-labelledby="game-title">
          <span className="eyebrow">Two-player classic</span>
          <h1 id="game-title">Tic Tac Toe</h1>
          <p>
            Take turns claiming spaces, line up three marks, and keep the match
            score rolling round after round.
          </p>

          <div className="scoreboard" aria-label="Match score">
            <div className="score-card">
              <span>Crosses</span>
              <strong>{scores.X}</strong>
            </div>
            <div className="score-card">
              <span>Draws</span>
              <strong>{draws}</strong>
            </div>
            <div className="score-card">
              <span>Noughts</span>
              <strong>{scores.O}</strong>
            </div>
          </div>
        </section>

        <section className="game-card" aria-label="Tic tac toe board">
          <div className="game-meta">
            <div>
              <span className="round-label">Round {round}</span>
              <p className="status" aria-live="polite">
                {statusText}
              </p>
            </div>
            <div className="turn-badge" aria-hidden="true">
              {gameState.winner || currentPlayer}
            </div>
          </div>

          <div className="board" role="grid" aria-label="Game board">
            {board.map((value, index) => {
              const isWinningCell = gameState.winningLine.includes(index);
              const cellClassName = [
                "cell",
                value ? `cell--${value.toLowerCase()}` : "",
                isWinningCell ? "cell--winner" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  aria-label={
                    value
                      ? `Square ${index + 1}, ${playerLabels[value]}`
                      : `Square ${index + 1}, play ${playerLabels[currentPlayer]}`
                  }
                  className={cellClassName}
                  disabled={Boolean(value) || isRoundOver}
                  key={index}
                  onClick={() => playSquare(index)}
                  role="gridcell"
                  type="button"
                >
                  <span>{value}</span>
                </button>
              );
            })}
          </div>

          <div className="actions">
            <button onClick={startNextRound} type="button">
              {isRoundOver ? "Next round" : "Restart round"}
            </button>
            <button onClick={resetMatch} type="button">
              Reset match
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TicTacToeGame;