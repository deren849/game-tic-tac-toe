const id = {
    a11yButton: "Aksesibilitas",
    langGroup: "Bahasa",
    statusYourTurn: "Giliranmu!",
    statusBotThinking: "Bot sedang berpikir...",
    statusYouWin: "Kamu menang!",
    statusBotWins: "Bot menang. Coba lagi!",
    statusDraw: "Seri!",
    boardLabel: "Papan tic tac toe {size} kali {size}",
    cellEmpty: "Baris {row}, kolom {col}: kosong",
    cellMark: "Baris {row}, kolom {col}: {mark}",
    moveHuman: "Kamu menaruh {mark} di baris {row}, kolom {col}.",
    moveBot: "Bot menaruh {mark} di baris {row}, kolom {col}.",
    sizeLabel: "Ukuran papan",
    levelLabel: "Tingkat kesulitan",
    levelEasy: "Mudah",
    levelHard: "Sulit",
    ruleHint3: "Susun 3 tanda berjajar untuk menang.",
    ruleHint5: "Susun 4 tanda berjajar untuk menang.",
    scoreYou: "Kamu",
    scoreDraw: "Seri",
    scoreBot: "Bot",
    resetGame: "Ulang Permainan",
    a11yTitle: "Pengaturan aksesibilitas",
    a11yIntro: "Sesuaikan tampilan agar nyaman untukmu. Perubahan langsung diterapkan dan tersimpan.",
    a11yClose: "Tutup",
    colorTitle: "Mode warna",
    colorDefault: "Normal",
    colorRedGreen: "Buta warna merah-hijau",
    colorBlueYellow: "Buta warna biru-kuning",
    colorMono: "Hitam-putih",
    colorNote: "X dan O selalu berbentuk beda, jadi game tidak bergantung pada warna saja.",
    textTitle: "Ukuran teks",
    textNormal: "Normal",
    textLarge: "Besar",
    textXLarge: "Sangat besar",
    displayTitle: "Tampilan",
    optContrast: "Kontras tinggi",
    optContrastHint: "Latar hitam, teks putih, garis tebal",
    optFont: "Font mudah dibaca",
    optFontHint: "Huruf lebih jelas dengan jarak lebih lega",
    optMotion: "Kurangi animasi",
    optMotionHint: "Matikan animasi dan efek bergerak",
    inputTitle: "Keyboard & pembaca layar",
    inputNote: "Di papan, gunakan WASD atau tombol panah untuk berpindah dan Enter/Spasi untuk memilih. Di bagian lain, W/A memindahkan fokus ke kontrol sebelumnya dan S/D ke berikutnya; Enter/Spasi mengaktifkan kontrol. Tab tetap bisa digunakan. Setiap langkah dibacakan untuk pembaca layar.",
    a11yReset: "Atur ulang",
    a11yDone: "Selesai",
};
const en = {
    a11yButton: "Accessibility",
    langGroup: "Language",
    statusYourTurn: "Your turn!",
    statusBotThinking: "Bot is thinking...",
    statusYouWin: "You win!",
    statusBotWins: "Bot wins. Try again!",
    statusDraw: "It's a draw!",
    boardLabel: "Tic tac toe board, {size} by {size}",
    cellEmpty: "Row {row}, column {col}: empty",
    cellMark: "Row {row}, column {col}: {mark}",
    moveHuman: "You placed {mark} at row {row}, column {col}.",
    moveBot: "Bot placed {mark} at row {row}, column {col}.",
    sizeLabel: "Board size",
    levelLabel: "Difficulty",
    levelEasy: "Easy",
    levelHard: "Hard",
    ruleHint3: "Get 3 in a row to win.",
    ruleHint5: "Get 4 in a row to win.",
    scoreYou: "You",
    scoreDraw: "Draw",
    scoreBot: "Bot",
    resetGame: "Restart Game",
    a11yTitle: "Accessibility settings",
    a11yIntro: "Adjust the game to suit you. Changes apply instantly and are saved.",
    a11yClose: "Close",
    colorTitle: "Color mode",
    colorDefault: "Normal",
    colorRedGreen: "Red-green color blindness",
    colorBlueYellow: "Blue-yellow color blindness",
    colorMono: "Grayscale",
    colorNote: "X and O always have different shapes, so the game never relies on color alone.",
    textTitle: "Text size",
    textNormal: "Normal",
    textLarge: "Large",
    textXLarge: "Extra large",
    displayTitle: "Display",
    optContrast: "High contrast",
    optContrastHint: "Black background, white text, bold outlines",
    optFont: "Easy-to-read font",
    optFontHint: "Clearer letters with wider spacing",
    optMotion: "Reduce motion",
    optMotionHint: "Turn off animations and moving effects",
    inputTitle: "Keyboard & screen reader",
    inputNote: "On the board, use WASD or the arrow keys to move and Enter/Space to select. Elsewhere, W/A moves focus to the previous control and S/D to the next; Enter/Space activates a control. Tab still works. Every move is announced to screen readers.",
    a11yReset: "Reset to default",
    a11yDone: "Done",
};
const dictionaries = { id, en };
let current = 'id';
export function getLang() {
    return current;
}
export function setLang(lang) {
    current = lang;
    document.documentElement.lang = lang;
}
function isKey(value) {
    return Object.hasOwn(id, value);
}
export function t(key, params = {}) {
    return dictionaries[current][key].replace(/\{(\w+)\}/g, (_match, name) => String(params[name] ?? ""));
}
export function detectLang(saved) {
    if (saved === 'id' || saved === 'en')
        return saved;
    return navigator.language.toLocaleLowerCase().startsWith("en") ? "en" : "id";
}
export function translatePage(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (key && isKey(key))
            el.textContent = t(key);
    });
    root.querySelectorAll("[data-i18n-label]").forEach((el) => {
        const key = el.dataset.i18nLabel;
        if (key && isKey(key))
            el.setAttribute("aria-label", t(key));
    });
}
