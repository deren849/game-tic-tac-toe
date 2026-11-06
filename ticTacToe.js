import { BOT, HUMAN, buildLines, chooseBotMove, emptyCells, findWinner, winLength, } from './game.js';
import { t, detectLang, setLang, translatePage } from './i18n.js';
import { applySetting, defaultSettings, loadSetting, saveSettings, readSettingForm, writeSettingsForm, } from "./setting.js";
import { readStorage, writeStorage } from './storage.js';
function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`elemen #${id} tidak di temukan`);
    return el;
}
function getAll(selector) {
    return Array.from(document.querySelectorAll(selector));
}
const boardEl = getEl("board");
const statusEl = getEl("status");
const announcerEl = getEl("announcer");
const ruleHintEl = getEl("rule-hint");
const resetBtn = getEl("reset");
const scoreWinEl = getEl("score-win");
const scoreDrawEl = getEl("score-draw");
const scoreLoseEl = getEl("score-lose");
const langButtons = getAll("[data-lang]");
const sizeButtons = getAll("[data-size]");
const levelButtons = getAll("[data-level]");
const dialog = getEl("a11y-dialog");
const a11yForm = getEl("a11y-form");
const a11yOpenBtn = getEl("a11y-open");
const a11yResetBtn = getEl("a11y-reset");
const LANG_KEY = "ttt:lang";
function markSvg(player) {
    if (player === "X") {
        return ('<svg class="mark mark-x" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<path pathLength="1" d="M26 26 L74 74"/>' +
            '<path pathLength="1" d="M74 26 L26 74"/>' +
            "</svg>");
    }
    return ('<svg class="mark mark-o" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
        '<circle pathLength="1" cx="50" cy="50" r="27" transform="rotate(-90 50 50)"/>' +
        "</svg>");
}
let size = 3;
let difficulty = 'hard';
let lines = buildLines(size, winLength(size));
let board = [];
let cellEls = [];
let gameOver = false;
let botThinking = false;
let botStart = false;
let round = 0;
let statusKey = 'statusYourTurn';
let statusKind = "";
const score = {
    3: { win: 0, draw: 0, lose: 0 },
    5: { win: 0, draw: 0, lose: 0 },
};
function setStatus(key, kind = "") {
    statusKey = key;
    statusKind = kind;
    renderStatus();
}
function renderStatus() {
    statusEl.textContent = t(statusKey);
    statusEl.className = `status ${statusKind}`.trim();
}
function announce(massage) {
    announcerEl.textContent = massage;
}
function position(index) {
    return { row: Math.floor(index / size) + 1, col: (index % size) + 1 };
}
function renderCell(index) {
    const el = cellEls[index];
    const value = board[index];
    const mark = value ?? "";
    if (el.dataset.mark !== mark) {
        el.innerHTML = value ? markSvg(value) : "";
        el.dataset.mark = mark;
    }
    const { row, col } = position(index);
    el.setAttribute("aria-label", value ? t("cellMark", { row, col, mark: value }) : t('cellEmpty', { row, col }));
    el.setAttribute("aria-disabled", String(value !== null || gameOver));
}
function renderAll() {
    board.forEach((_, i) => renderCell(i));
}
function renderScore() {
    const currentScore = score[size];
    scoreWinEl.textContent = String(currentScore.win);
    scoreDrawEl.textContent = String(currentScore.draw);
    scoreLoseEl.textContent = String(currentScore.lose);
}
function setPressed(button, isActive) {
    button.forEach((button) => button.setAttribute("aria-pressed", String(isActive(button))));
}
function renderTexts() {
    renderStatus();
    ruleHintEl.textContent = t(size === 3 ? "ruleHint3" : "ruleHint5");
    boardEl.setAttribute("aria-label", t("boardLabel", { size }));
    renderAll();
}
function setRovingFocus(active) {
    cellEls.forEach((el, i) => {
        el.tabIndex = i === active ? 0 : -1;
    });
}
function buildBoard() {
    boardEl.replaceChildren();
    boardEl.dataset.size = String(size);
    boardEl.style.setProperty("--n", String(size));
    cellEls = Array.from({ length: size * size }, (_, i) => {
        const button = document.createElement("button");
        button.type = 'button';
        button.className = "cell";
        button.tabIndex = i === 0 ? 0 : -1;
        button.addEventListener("click", () => handleHumanMove(i));
        boardEl.appendChild(button);
        return button;
    });
}
boardEl.addEventListener("focusin", (event) => {
    const index = cellEls.indexOf(event.target);
    if (index >= 0) {
        setRovingFocus(index);
    }
});
document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey)
        return;
    const target = event.target;
    if ((target instanceof HTMLInputElement &&
        !["radio", "checkbox", "button", "submit", "reset"].includes(target.type)) ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable))
        return;
    const key = event.key.toLowerCase();
    const index = cellEls.indexOf(target);
    if (index >= 0) {
        if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key))
            return;
        const row = Math.floor(index / size);
        const col = index % size;
        let nextRow = row;
        let nextCol = col;
        switch (key) {
            case "arrowup":
            case "w":
                nextRow = Math.max(0, row - 1);
                break;
            case "arrowdown":
            case "s":
                nextRow = Math.min(size - 1, row + 1);
                break;
            case "arrowleft":
            case "a":
                nextCol = Math.max(0, col - 1);
                break;
            case "arrowright":
            case "d":
                nextCol = Math.min(size - 1, col + 1);
                break;
        }
        event.preventDefault();
        cellEls[nextRow * size + nextCol].focus();
        return;
    }
    if (!["w", "a", "s", "d"].includes(key))
        return;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusScope = dialog.open ? dialog : document;
    const focusable = Array.from(focusScope.querySelectorAll(selector)).filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
    if (focusable.length === 0)
        return;
    const currentIndex = focusable.indexOf(target);
    const isPrevious = key === "w" || key === "a";
    const nextIndex = currentIndex < 0
        ? (isPrevious ? focusable.length - 1 : 0)
        : currentIndex + (isPrevious ? -1 : 1);
    if (nextIndex < 0 || nextIndex >= focusable.length)
        return;
    event.preventDefault();
    focusable[nextIndex].focus();
});
function finishIsOver() {
    const result = findWinner(board, lines);
    if (result) {
        gameOver = true;
        result.line.forEach((i) => cellEls[i].classList.add("win"));
        const humanWon = result.winner === HUMAN;
        score[size][humanWon ? "win" : "lose"]++;
        setStatus(humanWon ? "statusYouWin" : "statusBotWins", humanWon ? "win" : "lose");
    }
    else if (emptyCells(board).length === 0) {
        gameOver = true;
        score[size].draw++;
        setStatus("statusDraw");
    }
    else {
        return false;
    }
    botStart = !botStart;
    renderAll();
    renderScore();
    return true;
}
function placeMark(index, player) {
    board[index] = player;
    renderCell(index);
    const { row, col } = position(index);
    announce(t(player === HUMAN ? "moveHuman" : "moveBot", { mark: player, row, col }));
}
function handleHumanMove(index) {
    if (gameOver || botThinking || board[index] !== null)
        return;
    placeMark(index, HUMAN);
    if (finishIsOver())
        return;
    botTurn();
}
function botTurn() {
    botThinking = true;
    setStatus("statusBotThinking");
    const thisRound = round;
    window.setTimeout(() => {
        if (thisRound !== round)
            return;
        const move = chooseBotMove(board, size, difficulty, lines);
        botThinking = false;
        if (move < 0)
            return;
        placeMark(move, BOT);
        if (!finishIsOver())
            setStatus("statusYourTurn");
    }, 450);
}
function newGame() {
    round++;
    board = Array(size * size).fill(null);
    gameOver = false;
    botThinking = false;
    cellEls.forEach((el) => el.classList.remove("win"));
    renderAll();
    if (botStart)
        botTurn();
    else
        setStatus("statusYourTurn");
}
function setSize(next) {
    if (next === size)
        return;
    size = next;
    lines = buildLines(size, winLength(size));
    setPressed(sizeButtons, (b) => b.dataset.size === String(size));
    buildBoard();
    renderScore();
    newGame();
    renderTexts();
}
function setDifficulty(next) {
    if (next === difficulty)
        return;
    difficulty = next;
    setPressed(levelButtons, (b) => b.dataset.level === difficulty);
    newGame();
}
function applyLanguage(lang, persist) {
    setLang(lang);
    if (persist)
        writeStorage(LANG_KEY, lang);
    translatePage();
    setPressed(langButtons, (b) => b.dataset.lang === lang);
    renderTexts();
}
let settings = defaultSettings();
function openDialog() {
    if (dialog.open)
        return;
    if (typeof dialog.showModal === "function")
        dialog.showModal();
    else
        dialog.setAttribute("open", "");
}
function closeDialog() {
    if (typeof dialog.close === "function")
        dialog.close();
    else
        dialog.removeAttribute("open");
}
function initAccessibility() {
    const loaded = loadSetting();
    settings = loaded.settings;
    applySetting(settings);
    writeSettingsForm(a11yForm, settings);
    getAll(".swatch").forEach((el) => {
        el.innerHTML = markSvg("X") + markSvg("O");
    });
    a11yOpenBtn.addEventListener("click", openDialog);
    getAll("[data-close-dialog]").forEach((el) => el.addEventListener("click", closeDialog));
    dialog.addEventListener('close', () => saveSettings(settings));
    a11yForm.addEventListener("change", () => {
        settings = readSettingForm(a11yForm);
        applySetting(settings);
        saveSettings(settings);
    });
    a11yForm.addEventListener("submit", (event) => event.preventDefault());
    a11yResetBtn.addEventListener("click", () => {
        settings = defaultSettings();
        writeSettingsForm(a11yForm, settings);
        applySetting(settings);
        saveSettings(settings);
    });
    return loaded.firstVisit;
}
langButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang === "en" ? "en" : "id", true)));
sizeButtons.forEach((button) => button.addEventListener("click", () => setSize(button.dataset.size === "5" ? 5 : 3)));
levelButtons.forEach((button) => button.addEventListener("click", () => setDifficulty(button.dataset.level === "easy" ? "easy" : "hard")));
resetBtn.addEventListener("click", newGame);
const firstVisit = initAccessibility();
buildBoard();
renderScore();
applyLanguage(detectLang(readStorage(LANG_KEY)), false);
newGame();
// Pemain baru langsung ditawari pengaturan aksesibilitas saat pertama membuka game.
if (firstVisit)
    openDialog();
