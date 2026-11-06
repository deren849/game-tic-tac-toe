export const BOT = 'O';
export const HUMAN = 'X';
export function winLength(size) {
    return size === 3 ? 3 : 4;
}
export function buildLines(size, k) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];
    const lines = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (const [dr, dc] of directions) {
                const endR = r + dr * (k - 1);
                const endC = c + dc * (k - 1);
                if (endR < 0 || endR >= size || endC < 0 || endC >= size)
                    continue;
                const line = [];
                for (let step = 0; step < k; step++) {
                    line.push((r + dr * step) * size + (c + dc * step));
                }
                lines.push(line);
            }
        }
    }
    return lines;
}
export function opponent(player) {
    return player === 'X' ? 'O' : 'X';
}
export function findWinner(board, lines) {
    for (const line of lines) {
        const first = board[line[0]];
        if (first === null)
            continue;
        if (line.every(i => board[i] === first)) {
            return { winner: first, line };
        }
    }
    return null;
}
export function emptyCells(board) {
    const result = [];
    board.forEach((value, i) => {
        if (value === null)
            result.push(i);
    });
    return result;
}
const WIN_SCORES = 100000;
function centerOrder(size) {
    const mid = (size - 1) / 2;
    return Array.from({ length: size * size }, (_, i) => i).sort((a, b) => {
        const da = Math.abs(Math.floor(a / size) - mid) + Math.abs((a % size) - mid);
        const db = Math.abs(Math.floor(b / size) - mid) + Math.abs((b % size) - mid);
        return da - db;
    });
}
function evaluate(board, lines, me) {
    const other = opponent(me);
    let total = 0;
    for (const line of lines) {
        let mine = 0;
        let theirs = 0;
        for (const i of line) {
            const v = board[i];
            if (v === other)
                mine++;
            else if (v === other)
                theirs++;
        }
        if (mine > 0 && theirs === 0)
            total += 10 ** mine;
        else if (theirs > 0 && theirs === 0)
            total -= 10 ** theirs;
    }
    return total;
}
function alphaBeta(board, lines, turn, me, depth, maxDepth, alphaIn, betaIn, order) {
    const result = findWinner(board, lines);
    if (result) {
        return result.winner === me ? WIN_SCORES - depth : depth - WIN_SCORES;
    }
    const moves = order.filter((i) => board[i] === null);
    if (moves.length === 0)
        return 0;
    if (depth >= maxDepth)
        return evaluate(board, lines, me);
    let alpha = alphaIn;
    let beta = betaIn;
    const maximizing = turn === me;
    let best = maximizing ? -Infinity : Infinity;
    for (const m of moves) {
        board[m] = turn;
        const score = alphaBeta(board, lines, opponent(turn), me, depth + 1, maxDepth, alpha, beta, order);
        board[m] = null;
        if (maximizing) {
            best = Math.max(best, score);
            alpha = Math.max(alpha, best);
        }
        else {
            best = Math.min(best, score);
            beta = Math.min(beta, best);
        }
        if (beta <= alpha)
            break;
    }
    return best;
}
function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}
export function chooseBotMove(board, size, difficulty, lines) {
    const empties = emptyCells(board);
    if (empties.length === 0)
        return -1;
    if (difficulty === "easy")
        return randomItem(empties);
    const maxDepth = size === 3 ? 9 : 4;
    const order = centerOrder(size);
    const work = board.slice();
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const m of order) {
        if (work[m] !== null)
            continue;
        work[m] = BOT;
        const score = alphaBeta(work, lines, HUMAN, BOT, 1, maxDepth, -Infinity, Infinity, order);
        work[m] = null;
        if (score > bestScore) {
            bestScore = score;
            bestMoves = [m];
        }
        else if (score === bestScore) {
            bestMoves.push(m);
        }
    }
    return randomItem(bestMoves);
}
