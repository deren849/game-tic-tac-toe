"use strict";
const HUMAN = "X";
const BOT = "O";
const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // baris
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // kolom
    [0, 4, 8], [2, 4, 6], // diagonal
];
// Helper: ambil elemen DOM, error jelas kalau tidak ada
function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Elemen #${id} tidak ditemukan`);
    return el;
}
const boardEl = getEl("board");
const statusEl = getEl("status");
const resetBtn = getEl("reset");
const easyBtn = getEl("easy");
const hardBtn = getEl("hard");
const scoreWinEl = getEl("score-win");
const scoreDrawEl = getEl("score-draw");
const scoreLoseEl = getEl("score-lose");
let board = Array(9).fill(null);
let gameOver = false;
let botThinking = false;
let botStarts = false;
let round = 0;
let difficulty = "hard";
const score = { win: 0, draw: 0, lose: 0 };
const cellEls = [];
// Logika permainannya
function findWinner(b) {
    for (const line of WIN_LINES) {
        const [a, c, d] = line;
        const v = b[a];
        if (v && v === b[c] && v === b[d]) {
            return { winner: v, line };
        }
    }
    return null;
}
function emptyCells(b) {
    const result = [];
    b.forEach((v, i) => {
        if (v === null)
            result.push(i);
    });
    return result;
}
// Minimax: nilai positif = bagus untuk bot, negatif = bagus untuk manusia
function minimax(b, turn, depth) {
    const res = findWinner(b);
    if (res)
        return res.winner === BOT ? 10 - depth : depth - 10;
    const moves = emptyCells(b);
    if (moves.length === 0)
        return 0;
    const next = turn === BOT ? HUMAN : BOT;
    const scores = moves.map((m) => {
        b[m] = turn;
        const s = minimax(b, next, depth + 1);
        b[m] = null;
        return s;
    });
    return turn === BOT ? Math.max(...scores) : Math.min(...scores);
}
function bestMove(b) {
    let best = -Infinity;
    let move = -1;
    for (const m of emptyCells(b)) {
        b[m] = BOT;
        const s = minimax(b, HUMAN, 1);
        b[m] = null;
        if (s > best) {
            best = s;
            move = m;
        }
    }
    return move;
}
function randomMove(b) {
    const moves = emptyCells(b);
    return moves[Math.floor(Math.random() * moves.length)];
}
// Tampilan permainan
function setStatus(text, kind = "") {
    statusEl.textContent = text;
    statusEl.className = `status ${kind}`.trim();
}
function renderCell(i) {
    const el = cellEls[i];
    const value = board[i];
    el.innerHTML = value ? `<span class="mark ${value.toLowerCase()}"></span>` : "";
    el.disabled = value !== null || gameOver;
    el.setAttribute("aria-label", value ? `Kotak ${i + 1}: ${value}` : `Kotak ${i + 1} kosong`);
}
function renderAll() {
    board.forEach((_, i) => renderCell(i));
}
function renderScore() {
    scoreWinEl.textContent = String(score.win);
    scoreDrawEl.textContent = String(score.draw);
    scoreLoseEl.textContent = String(score.lose);
}
function buildBoard() {
    for (let i = 0; i < 9; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell";
        btn.addEventListener("click", () => handleHumanMove(i));
        boardEl.appendChild(btn);
        cellEls.push(btn);
    }
}
// Alur permainan game ini
function finishIfOver() {
    const res = findWinner(board);
    if (res) {
        gameOver = true;
        res.line.forEach((i) => cellEls[i].classList.add("win"));
        if (res.winner === HUMAN) {
            score.win++;
            setStatus("Kamu menang! ", "win");
        }
        else {
            score.lose++;
            setStatus("Bot menang. Coba lagi!", "lose");
        }
        renderAll();
        renderScore();
        return true;
    }
    if (emptyCells(board).length === 0) {
        gameOver = true;
        score.draw++;
        setStatus("Seri! ");
        renderAll();
        renderScore();
        return true;
    }
    return false;
}
function handleHumanMove(i) {
    if (gameOver || botThinking || board[i] !== null)
        return;
    board[i] = HUMAN;
    renderCell(i);
    if (finishIfOver())
        return;
    botTurn();
}
function botTurn() {
    botThinking = true;
    setStatus("Bot sedang berpikir...");
    const thisRound = round;
    // jeda kecil agar terasa natural biar kerasa seperti bot dari claude
    window.setTimeout(() => {
        if (thisRound !== round)
            return; // ronde sudah direset, abaikan
        const move = difficulty === "hard" ? bestMove(board) : randomMove(board);
        board[move] = BOT;
        botThinking = false;
        renderCell(move);
        if (!finishIfOver())
            setStatus("Giliranmu!");
    }, 450);
}
function newGame() {
    round++;
    board = Array(9).fill(null);
    gameOver = false;
    botThinking = false;
    cellEls.forEach((el) => el.classList.remove("win"));
    renderAll();
    if (botStarts) {
        botTurn();
    }
    else {
        setStatus("Giliranmu!");
    }
    botStarts = !botStarts;
}
function setDifficulty(d) {
    difficulty = d;
    easyBtn.classList.toggle("active", d === "easy");
    hardBtn.classList.toggle("active", d === "hard");
    newGame();
}
// Mulai game
buildBoard();
resetBtn.addEventListener("click", newGame);
easyBtn.addEventListener("click", () => setDifficulty("easy"));
hardBtn.addEventListener("click", () => setDifficulty("hard"));
renderScore();
newGame();
