import { BOT, HUMAN, buildLines, chooseBotMove, emptyCells, findWinner, winLength, } from './game.js';
import { t, detectLang, setLang, translatePage } from './i18n.js';
import { applySetting, defaultSettings, loadSetting, saveSettings, readSettingForm, writeSettingsForm, } from "./setting.js";
import { ROUND_LIMITS, defaultPrefs, loadPrefs, readPrefsForm, savePrefs, writePrefsForm, } from './Prefs.js';
import { playSfx, setSound, unlockAudio } from './Sound.js';
import { ashFall, bigCelebration, clearEffects, confettiCannons, initEffects, setEffectEnabled, sparkBurst, themeColor, vibrate, } from './Effects.js';
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
const roundInfoEl = getEl("round-info");
const resetBtn = getEl("reset");
const scoreWinEl = getEl("score-win");
const scoreDrawEl = getEl("score-draw");
const scoreLoseEl = getEl("score-lose");
const flashEl = getEl("flash");
const langButtons = getAll("[data-lang]");
const sizeButtons = getAll("[data-size]");
const levelButtons = getAll("[data-level]");
const limitButtons = getAll("[data-limit]");
const dialog = getEl("a11y-dialog");
const a11yForm = getEl("a11y-form");
const a11yOpenBtn = getEl("a11y-open");
const a11yResetBtn = getEl("a11y-reset");
const gameDialog = getEl("game-dialog");
const gameForm = getEl("game-form");
const gameOpenBtn = getEl("game-open");
const gameResetBtn = getEl("game-reset");
const volumeOutEl = getEl("volume-out");
const vibrationTestBtn = getEl("vibration-test");
const vibrationStatusEl = getEl("vibration-status");
const matchDialog = getEl("match-dialog");
const matchTitleEl = getEl("match-title");
const matchSummaryEl = getEl("match-summary");
const matchTrophyEl = getEl("match-trophy");
const matchAgainBtn = getEl("match-again");
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
let settings = defaultSettings();
let prefs = defaultPrefs();
function playedRounds() {
    const s = score[size];
    return s.win + s.draw + s.lose;
}
function isMatchOver() {
    return prefs.roundLimit !== 0 && playedRounds() >= prefs.roundLimit;
}
function resetStats(target) {
    const sizes = target === "all" ? [3, 5] : [target];
    sizes.forEach((s) => {
        score[s] = { win: 0, draw: 0, lose: 0 };
    });
}
function matchOutcome() {
    const s = score[size];
    if (s.win > s.lose)
        return "win";
    if (s.win < s.lose)
        return "lose";
    return "draw";
}
function renderRoundInfo() {
    const over = isMatchOver();
    if (over) {
        roundInfoEl.textContent = t("roundInfoDone");
    }
    else {
        const current = gameOver ? playedRounds() : playedRounds() + 1;
        roundInfoEl.textContent =
            prefs.roundLimit === 0
                ? t('roundInfoInf', { current })
                : t('roundInfo', { current, total: prefs.roundLimit });
    }
    resetBtn.textContent = t(over ? "newMatch" : "resetGame");
}
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
function renderMatchDialog() {
    const s = score[size];
    const outcome = matchOutcome();
    matchTitleEl.textContent = t(outcome === 'win' ? "matchWin" : outcome === 'lose' ? "matchLose" : 'matchDraw');
    matchTrophyEl.textContent = outcome === "win" ? "🏆" : outcome === "lose" ? "🤖" : "🤝";
    matchSummaryEl.textContent = t("matchSummary", {
        win: s.win,
        draw: s.draw,
        lose: s.lose,
        total: playedRounds(),
    });
}
function renderTexts() {
    renderStatus();
    renderRoundInfo();
    ruleHintEl.textContent = t(size === 3 ? "ruleHint3" : "ruleHint5");
    boardEl.setAttribute("aria-label", t("boardLabel", { size }));
    if (matchDialog.open)
        renderMatchDialog();
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
    const focusScope = document.querySelector("dialog[open]") ?? document;
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
function refreshEffects() {
    setEffectEnabled(prefs.effectsOn && !settings.reduceMotion);
}
function applyPrefs() {
    setSound(prefs.soundOn, prefs.volume / 100);
    refreshEffects();
}
let winLineEl = null;
let winLineCells = [];
function placeWinLine() {
    if (!winLineEl || winLineCells.length === 0)
        return;
    const first = cellEls[winLineCells[0]];
    const last = cellEls[winLineCells[winLineCells.length - 1]];
    if (!first || !last)
        return;
    const x1 = first.offsetLeft + first.offsetWidth / 2;
    const y1 = first.offsetTop + first.offsetHeight / 2;
    const x2 = last.offsetLeft + last.offsetWidth / 2;
    const y2 = last.offsetTop + last.offsetHeight / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const extend = first.offsetWidth * 0.32;
    const startX = x1 - (dx / length) * extend;
    const startY = y1 - (dy / length) * extend;
    winLineEl.style.left = `${startX}px`;
    winLineEl.style.top = `${startY}px`;
    winLineEl.style.width = `${length + extend * 2}px`;
    winLineEl.style.setProperty("--angle", `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`);
}
function showWinLine(line) {
    removeWinLine();
    winLineCells = line;
    winLineEl = document.createElement("div");
    winLineEl.className = "win-line";
    boardEl.appendChild(winLineEl);
    placeWinLine();
}
function removeWinLine() {
    winLineEl?.remove();
    winLineEl = null;
    winLineCells = [];
}
new ResizeObserver(() => placeWinLine()).observe(boardEl);
function playFlash(kind) {
    flashEl.className = "flash";
    void flashEl.offsetWidth;
    flashEl.classList.add(kind);
}
function clearResultFx() {
    clearEffects();
    removeWinLine();
    boardEl.classList.remove("fx-win", "fx-lose", "has-winner");
    flashEl.className = "flash";
}
function playResultEffects(winner, line) {
    if (winner === HUMAN) {
        playSfx("win");
        vibrate([240, 90, 240, 90, 420]);
        boardEl.classList.add("fx-win", "has-winner");
        playFlash("flash-win");
        confettiCannons();
    }
    else if (winner === BOT) {
        playSfx("lose");
        vibrate([350, 100, 350]);
        boardEl.classList.add("fx-lose", "has-winner");
        playFlash("flash-lose");
        ashFall();
    }
    else {
        playSfx("draw");
    }
    if (line)
        showWinLine(line);
}
function showMatchResult() {
    renderMatchDialog();
    const outcome = matchOutcome();
    if (outcome === "win") {
        playSfx("matchWin");
        vibrate([250, 80, 250, 80, 250, 80, 500]);
        bigCelebration();
    }
    else if (outcome === "lose") {
        playSfx("matchLose");
        ashFall(true);
    }
    else {
        playSfx("draw");
    }
    openDialogEl(matchDialog);
}
function finishIsOver() {
    const result = findWinner(board, lines);
    if (result) {
        gameOver = true;
        result.line.forEach((i) => cellEls[i].classList.add("win"));
        const humanWon = result.winner === HUMAN;
        score[size][humanWon ? "win" : "lose"]++;
        setStatus(humanWon ? "statusYouWin" : "statusBotWins", humanWon ? "win" : "lose");
        playResultEffects(result.winner, result.line);
    }
    else if (emptyCells(board).length === 0) {
        gameOver = true;
        score[size].draw++;
        setStatus("statusDraw");
        playResultEffects(null, null);
    }
    else {
        return false;
    }
    botStart = !botStart;
    renderAll();
    renderScore();
    renderRoundInfo();
    if (isMatchOver()) {
        const thisRound = round;
        window.setTimeout(() => {
            if (thisRound === round && isMatchOver())
                showMatchResult();
        }, 1500);
    }
    return true;
}
function placeMark(index, player) {
    board[index] = player;
    renderCell(index);
    playSfx(player === HUMAN ? "placeX" : "placeO");
    const rect = cellEls[index].getBoundingClientRect();
    sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, themeColor(player === HUMAN ? "--x" : "--o"));
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
    clearResultFx();
    board = Array(size * size).fill(null);
    gameOver = false;
    botThinking = false;
    cellEls.forEach((el) => el.classList.remove("win"));
    renderAll();
    renderScore();
    renderRoundInfo();
    if (botStart)
        botTurn();
    else
        setStatus("statusYourTurn");
}
function newMatch() {
    resetStats(size);
    newGame();
}
function setSize(next) {
    if (next === size)
        return;
    size = next;
    lines = buildLines(size, winLength(size));
    setPressed(sizeButtons, (b) => b.dataset.size === String(size));
    playSfx("tick");
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
    playSfx("tick");
    newGame();
}
function setRoundLimit(next) {
    if (next === prefs.roundLimit)
        return;
    prefs = { ...prefs, roundLimit: next };
    savePrefs(prefs);
    setPressed(limitButtons, (b) => b.dataset.limit === String(next));
    playSfx("tick");
    resetStats("all");
    newGame();
}
function applyLanguage(lang, persist) {
    setLang(lang);
    if (persist) {
        writeStorage(LANG_KEY, lang);
        playSfx("tick");
    }
    translatePage();
    setPressed(langButtons, (b) => b.dataset.lang === lang);
    renderTexts();
}
function openDialogEl(el) {
    if (el.open)
        return;
    if (typeof el.showModal === "function")
        el.showModal();
    else
        el.setAttribute("open", "");
}
function closeDialogEl(el) {
    if (typeof el.close === "function")
        el.close();
    else
        el.removeAttribute("open");
}
function initDialogs() {
    getAll("dialog").forEach((el) => {
        el.addEventListener("click", (event) => {
            if (event.target === el)
                closeDialogEl(el);
        });
    });
    getAll("[data-close-dialog]").forEach((el) => el.addEventListener("click", () => {
        const owner = el.closest("dialog");
        if (owner)
            closeDialogEl(owner);
    }));
}
function initAccessibility() {
    const loaded = loadSetting();
    settings = loaded.settings;
    applySetting(settings);
    writeSettingsForm(a11yForm, settings);
    getAll(".swatch").forEach((el) => {
        el.innerHTML = markSvg("X") + markSvg("O");
    });
    a11yOpenBtn.addEventListener("click", () => openDialogEl(dialog));
    dialog.addEventListener('close', () => saveSettings(settings));
    a11yForm.addEventListener("change", () => {
        settings = readSettingForm(a11yForm);
        applySetting(settings);
        saveSettings(settings);
        refreshEffects();
    });
    a11yForm.addEventListener("submit", (event) => event.preventDefault());
    a11yResetBtn.addEventListener("click", () => {
        settings = defaultSettings();
        writeSettingsForm(a11yForm, settings);
        applySetting(settings);
        saveSettings(settings);
        refreshEffects();
    });
    return loaded.firstVisit;
}
function iniGameSetting() {
    prefs = loadPrefs();
    writePrefsForm(gameForm, prefs);
    volumeOutEl.textContent = `${prefs.volume}%`;
    setPressed(limitButtons, (b) => b.dataset.limit === String(prefs.roundLimit));
    applyPrefs();
    gameOpenBtn.addEventListener("click", () => openDialogEl(gameDialog));
    gameDialog.addEventListener("close", () => savePrefs(prefs));
}
gameForm.addEventListener("input", (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.name === "volume") {
        volumeOutEl.textContent = `${input.value}`;
    }
});
gameForm.addEventListener("change", () => {
    prefs = readPrefsForm(gameForm, prefs);
    volumeOutEl.textContent = `${prefs.volume}%`;
    savePrefs(prefs);
    applyPrefs();
    playSfx("tick");
});
gameForm.addEventListener("submit", (event) => event.preventDefault());
vibrationTestBtn.addEventListener("click", () => {
    if (typeof navigator.vibrate !== "function") {
        vibrationStatusEl.textContent = t("vibrationUnsupported");
        return;
    }
    if (!prefs.effectsOn || settings.reduceMotion) {
        vibrationStatusEl.textContent = t("vibrationDisabled");
        return;
    }
    vibrationStatusEl.textContent = t(vibrate([300, 100, 300]) ? "vibrationSent" : "vibrationRejected");
});
gameResetBtn.addEventListener("click", () => {
    prefs = { ...defaultPrefs(), roundLimit: prefs.roundLimit };
    writePrefsForm(gameForm, prefs);
    volumeOutEl.textContent = `${prefs.volume}%`;
    savePrefs(prefs);
    applyPrefs();
    playSfx("tick");
});
langButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang === "en" ? "en" : "id", true)));
sizeButtons.forEach((button) => button.addEventListener("click", () => setSize(button.dataset.size === "5" ? 5 : 3)));
levelButtons.forEach((button) => button.addEventListener("click", () => setDifficulty(button.dataset.level === "easy" ? "easy" : "hard")));
limitButtons.forEach((button) => button.addEventListener("click", () => {
    const value = Number(button.dataset.limit);
    const limit = ROUND_LIMITS.find((option) => option === value);
    if (limit !== undefined)
        setRoundLimit(limit);
}));
resetBtn.addEventListener("click", () => {
    playSfx("tick");
    if (isMatchOver())
        newMatch();
    else
        newGame();
});
matchAgainBtn.addEventListener("click", () => {
    closeDialogEl(matchDialog);
    playSfx("tick");
    newMatch();
});
document.addEventListener("pointerdown", unlockAudio);
document.addEventListener("keydown", unlockAudio);
initEffects(getEl("fx"));
initDialogs();
const firstVisit = initAccessibility();
iniGameSetting();
buildBoard();
renderScore();
applyLanguage(detectLang(readStorage(LANG_KEY)), false);
newGame();
// Pemain baru langsung ditawari pengaturan aksesibilitas saat pertama membuka game.
if (firstVisit)
    openDialogEl(dialog);
