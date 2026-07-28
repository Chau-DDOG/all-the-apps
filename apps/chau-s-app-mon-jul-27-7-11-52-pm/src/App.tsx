import { useMemo, useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;
type Mode = "computer" | "friend";
type Scoreboard = Record<Player | "draws", number>;

const emptyBoard: Cell[] = Array<Cell>(9).fill(null);
const initialScores: Scoreboard = { X: 0, O: 0, draws: 0 };
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function getWinningLine(board: Cell[]) {
  return winningLines.find(([first, second, third]) => {
    const player = board[first];
    return player && player === board[second] && player === board[third];
  });
}

function isBoardFull(board: Cell[]) {
  return board.every(Boolean);
}

function getWinner(board: Cell[]) {
  const line = getWinningLine(board);
  return line ? board[line[0]] : null;
}

function scoreBoard(board: Cell[], depth: number): number {
  const winner = getWinner(board);
  if (winner === "O") {
    return 10 - depth;
  }
  if (winner === "X") {
    return depth - 10;
  }
  return 0;
}

function findBestComputerMove(board: Cell[]) {
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove = -1;

  board.forEach((cell, index) => {
    if (cell) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = "O";
    const moveScore = minimax(nextBoard, 0, false);
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = index;
    }
  });

  return bestMove;
}

function minimax(board: Cell[], depth: number, isMaximizing: boolean): number {
  const winner = getWinner(board);
  if (winner || isBoardFull(board)) {
    return scoreBoard(board, depth);
  }

  if (isMaximizing) {
    let bestScore = Number.NEGATIVE_INFINITY;
    board.forEach((cell, index) => {
      if (!cell) {
        const nextBoard = [...board];
        nextBoard[index] = "O";
        bestScore = Math.max(bestScore, minimax(nextBoard, depth + 1, false));
      }
    });
    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;
  board.forEach((cell, index) => {
    if (!cell) {
      const nextBoard = [...board];
      nextBoard[index] = "X";
      bestScore = Math.min(bestScore, minimax(nextBoard, depth + 1, true));
    }
  });
  return bestScore;
}

function App() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [mode, setMode] = useState<Mode>("computer");
  const [scores, setScores] = useState<Scoreboard>(initialScores);

  const winningLine = useMemo(() => getWinningLine(board), [board]);
  const winner = winningLine ? board[winningLine[0]] : null;
  const hasDraw = !winner && isBoardFull(board);
  const gameOver = Boolean(winner || hasDraw);

  const statusText = useMemo(() => {
    if (winner) {
      return `${winner} wins this round!`;
    }
    if (hasDraw) {
      return "Cat's game. Nobody wins this round.";
    }
    if (mode === "computer") {
      return "Your turn as X.";
    }
    return `Player ${currentPlayer}'s turn.`;
  }, [currentPlayer, hasDraw, mode, winner]);

  const recordResult = (finishedBoard: Cell[]) => {
    const roundWinner = getWinner(finishedBoard);
    if (roundWinner) {
      setScores((currentScores) => ({
        ...currentScores,
        [roundWinner]: currentScores[roundWinner] + 1,
      }));
      return;
    }

    if (isBoardFull(finishedBoard)) {
      setScores((currentScores) => ({
        ...currentScores,
        draws: currentScores.draws + 1,
      }));
    }
  };

  const resetBoard = () => {
    setBoard(emptyBoard);
    setCurrentPlayer("X");
  };

  const resetEverything = () => {
    resetBoard();
    setScores(initialScores);
  };

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    resetBoard();
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameOver) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;

    if (mode === "friend") {
      setBoard(nextBoard);
      recordResult(nextBoard);
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      return;
    }

    const humanWon = getWinner(nextBoard);
    if (humanWon || isBoardFull(nextBoard)) {
      setBoard(nextBoard);
      recordResult(nextBoard);
      return;
    }

    const computerMove = findBestComputerMove(nextBoard);
    if (computerMove >= 0) {
      nextBoard[computerMove] = "O";
    }

    setBoard(nextBoard);
    recordResult(nextBoard);
    setCurrentPlayer("X");
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">CLASSIC STRATEGY</span>
          <h1>Tic Tac Toe</h1>
          <p>
            Play a polished round against a perfect computer opponent or pass
            the board to a friend. Line up three marks to win.
          </p>
        </div>

        <div className="mode-switch" aria-label="Choose game mode">
          <button
            className={mode === "computer" ? "active" : ""}
            onClick={() => handleModeChange("computer")}
            type="button"
          >
            Play computer
          </button>
          <button
            className={mode === "friend" ? "active" : ""}
            onClick={() => handleModeChange("friend")}
            type="button"
          >
            Two players
          </button>
        </div>
      </section>

      <section className="game-card" aria-label="Tic tac toe game">
        <div className="status-row">
          <div>
            <span className="eyebrow dark">CURRENT ROUND</span>
            <h2>{statusText}</h2>
          </div>
          <button
            className="secondary-action"
            onClick={resetBoard}
            type="button"
          >
            New round
          </button>
        </div>

        <div className="board" role="grid" aria-label="Tic tac toe board">
          {board.map((cell, index) => {
            const isWinningCell = winningLine
              ? winningLine.some((cellIndex) => cellIndex === index)
              : false;
            return (
              <button
                aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ""}`}
                className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ""} ${
                  isWinningCell ? "winning-cell" : ""
                }`}
                disabled={Boolean(cell || gameOver)}
                key={index}
                onClick={() => handleCellClick(index)}
                role="gridcell"
                type="button"
              >
                {cell}
              </button>
            );
          })}
        </div>

        <div className="scoreboard" aria-label="Scoreboard">
          <div>
            <span>X</span>
            <strong>{scores.X}</strong>
            <small>{mode === "computer" ? "You" : "Player X"}</small>
          </div>
          <div>
            <span>Draws</span>
            <strong>{scores.draws}</strong>
            <small>Even match</small>
          </div>
          <div>
            <span>O</span>
            <strong>{scores.O}</strong>
            <small>{mode === "computer" ? "Computer" : "Player O"}</small>
          </div>
        </div>

        <button
          className="primary-action"
          onClick={resetEverything}
          type="button"
        >
          Reset scores
        </button>
      </section>
    </main>
  );
}

export default App;
