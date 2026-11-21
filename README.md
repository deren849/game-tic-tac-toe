# Tic Tac Toe — Lawan Bot

Game Tic Tac Toe melawan bot, dibuat dengan **TypeScript, CSS, dan HTML murni** (tanpa framework dan tanpa library). Tampilannya estetik, responsif di HP, dan punya fitur aksesibilitas, efek suara, serta efek partikel.

## Fitur

**Permainan**
- Papan **3×3** (3 berjajar) dan **5×5** (4 berjajar).
- Bot dengan dua tingkat kesulitan: **Mudah** (acak) dan **Sulit** (minimax dengan alpha-beta pruning).
- Skor dipisah per ukuran papan.
- **Batas ronde:** ∞ (tanpa batas), 3, 5, 7, atau 10. Setelah ronde terakhir muncul dialog hasil pertandingan.
- Giliran pertama bergantian tiap ronde.

**Suara dan efek**
- Efek suara dibuat langsung dengan **Web Audio API** (tanpa file mp3). X dan O punya bunyi berbeda; ada bunyi menang, kalah, seri, dan hasil pertandingan.
- Efek partikel di `<canvas>`: percikan saat menaruh tanda, konfeti saat menang, abu jatuh saat kalah, kembang api saat menang pertandingan.
- Garis cahaya yang mencoret tanda pemenang, kilat layar, dan papan bergetar saat kalah.
- Getar di HP (Vibration API) bila perangkat mendukung.
- Volume dan efek bisa diatur atau dimatikan di **Pengaturan game**.

**Aksesibilitas** (dialog terbuka otomatis saat pertama kali game dibuka)
- Mode warna: normal, buta warna merah-hijau, buta warna biru-kuning, hitam-putih.
- Ukuran teks: normal, besar, sangat besar.
- Kontras tinggi, font mudah dibaca, dan kurangi animasi (otomatis mengikuti `prefers-reduced-motion`; juga mematikan partikel dan getar).
- X dan O selalu berbeda **bentuk**, jadi game tidak bergantung pada warna saja.
- Bisa dimainkan penuh dengan keyboard; setiap langkah diumumkan untuk pembaca layar (`aria-live`).

**Lainnya**
- Dua bahasa: **Indonesia** dan **English** (tombol terpisah, pilihan tersimpan).
- Semua pengaturan tersimpan di `localStorage`.

## Kontrol keyboard

| Tombol | Fungsi |
|---|---|
| Panah atau `W` `A` `S` `D` (di papan) | Pindah antar kotak |
| `Enter` atau `Spasi` | Memilih kotak atau menekan tombol |
| `W` / `A` (di luar papan) | Fokus ke kontrol sebelumnya |
| `S` / `D` (di luar papan) | Fokus ke kontrol berikutnya |
| `Tab` | Tetap bisa dipakai seperti biasa |
| `Esc` | Menutup dialog |

## Struktur proyek

```
.
├── index.html
└── src/
    ├── TicTacToe.css   # tampilan, tema warna, animasi, responsif
    ├── ticTacToe.ts    # logika UI dan alur permainan (titik masuk)
    ├── game.ts         # aturan game dan bot (minimax + alpha-beta)
    ├── i18n.ts         # terjemahan Indonesia / English
    ├── setting.ts      # pengaturan aksesibilitas
    ├── prefs.ts        # pengaturan game: suara, volume, efek, batas ronde
    ├── sound.ts        # efek suara (Web Audio API)
    ├── effects.ts      # efek partikel (canvas)
    └── storage.ts      # pembungkus localStorage yang aman
```

## Menjalankan

`index.html` memuat `src/ticTacToe.ts` sebagai modul, jadi proyek perlu dijalankan lewat dev server yang bisa memproses TypeScript (misalnya Vite):

```bash
npm install
npm run dev
```

Untuk build produksi:

```bash
npm run build
```

> Sesuaikan perintah dengan konfigurasi proyekmu.

## Catatan teknis

- **Bot:** minimax dengan alpha-beta pruning dan urutan langkah dari tengah. Papan 3×3 dihitung penuh (kedalaman 9, jadi bot tidak bisa dikalahkan). Papan 5×5 dibatasi kedalaman 4 dan memakai fungsi penilaian `evaluate()` agar tetap cepat.
- **Garis kemenangan** dibuat otomatis oleh `buildLines(size, k)` untuk ukuran papan dan panjang menang berapa pun.
- **Suara** baru bisa berbunyi setelah pemain berinteraksi (aturan autoplay browser), jadi `AudioContext` dibuat saat sentuhan atau tombol pertama.
- **Efek** otomatis nonaktif bila "Kurangi animasi" menyala.

## Riwayat perubahan

### v3 — Suara, efek, dan batas ronde

**Baru**
- Efek suara Web Audio (`sound.ts`) dan efek partikel canvas (`effects.ts`).
- Batas ronde (∞, 3, 5, 7, 10), info ronde, dan dialog hasil pertandingan.
- Dialog **Pengaturan game** (suara, volume, efek visual) dan modul `prefs.ts`.
- Animasi menang dan kalah: garis pemenang, kilat layar, papan bergetar, kotak non-pemenang diredupkan.
- Penanganan dialog umum (`openDialogEl`, `closeDialogEl`, `initDialogs`): klik area gelap atau tombol `data-close-dialog` menutup dialog.

**Diubah**
- Papan skor: nama dan simbol dibungkus satu `.score-label`.
- Navigasi WASD di luar papan kini bekerja di dalam dialog mana pun yang sedang terbuka.
- Mengganti batas ronde memulai pertandingan baru dan mereset skor.

**Diperbaiki**
- `evaluate()` di `game.ts`: tanda lawan dulu dihitung sebagai milik bot dan satu cabang tidak pernah berjalan, sehingga bot 5×5 menilai posisi terbalik. Dalam simulasi, bot versi lama kalah 37 dari 40 ronde melawan versi yang sudah diperbaiki.
- `index.html`: `</span>` nyasar di papan skor dan beberapa teks yang belum ikut terjemahan.

### v2 — Aksesibilitas dan bahasa
- Dialog aksesibilitas: mode buta warna, ukuran teks, kontras tinggi, font mudah dibaca, kurangi animasi.
- Tombol bahasa ID/EN terpisah dari tombol aksesibilitas, dan tombol ulang permainan.
- Papan 5×5, tampilan responsif untuk HP, serta navigasi keyboard dan pengumuman untuk pembaca layar.
- Kode dipecah menjadi beberapa modul (`game`, `i18n`, `setting`, `storage`).

### v1 — Versi awal
- Tic Tac Toe 3×3 melawan bot dengan tampilan estetik.

## Keterbatasan yang diketahui

- Efek suara sudah diuji tidak menimbulkan error, tetapi belum didengarkan langsung di berbagai perangkat.
- Belum diuji di HP sungguhan dan dengan pembaca layar nyata (hanya lewat emulasi browser).







## Version English

# Tic Tac Toe — Play Against Bot

A Tic Tac Toe game against a bot, built with **vanilla TypeScript, CSS, and HTML** (no frameworks and no libraries). Features an aesthetic design, mobile responsiveness, accessibility options, sound effects, and particle effects.

## Features

**Gameplay**
- **3×3** (3-in-a-row) and **5×5** (4-in-a-row) boards.
- Bot with two difficulty levels: **Easy** (random) and **Hard** (minimax with alpha-beta pruning).
- Scores tracked separately per board size.
- **Round limit:** ∞ (unlimited), 3, 5, 7, or 10. A match result dialog appears after the final round.
- First turn alternates every round.

**Sound & Effects**
- Sound effects generated directly using the **Web Audio API** (no mp3 files). X and O have distinct sounds; includes sound effects for win, loss, draw, and match results.
- Particle effects on `<canvas>`: sparks when placing a mark, confetti on win, falling ash on loss, and fireworks on match victory.
- Glowing strike-through line across winning marks, screen flash, and board shake on loss.
- Haptic vibration on mobile devices (Vibration API) where supported.
- Volume and effects can be adjusted or disabled in **Game Settings**.

**Accessibility** (dialog opens automatically on first launch)
- Color modes: normal, red-green colorblind, blue-yellow colorblind, monochrome.
- Text sizes: normal, large, extra large.
- High contrast, readable font, and reduce motion (automatically follows `prefers-reduced-motion`; also disables particles and vibration).
- X and O always have distinct **shapes**, ensuring the game does not rely on color alone.
- Fully playable via keyboard; every move is announced for screen readers (`aria-live`).

**Other**
- Bilingual: **Indonesian** and **English** (dedicated toggle button, preference saved).
- All settings are saved in `localStorage`.

## Keyboard Controls

| Key | Function |
|---|---|
| Arrow keys or `W` `A` `S` `D` (on board) | Move between cells |
| `Enter` or `Space` | Select cell or press button |
| `W` / `A` (outside board) | Focus previous control |
| `S` / `D` (outside board) | Focus next control |
| `Tab` | Works normally as expected |
| `Esc` | Close dialog |

## Project Structure

```
.
├── index.html
└── src/
    ├── TicTacToe.css   # layout, color themes, animations, responsiveness
    ├── ticTacToe.ts    # UI logic and game flow (entry point)
    ├── game.ts         # game rules and bot AI (minimax + alpha-beta)
    ├── i18n.ts         # Indonesian / English translations
    ├── setting.ts      # accessibility settings
    ├── prefs.ts        # game preferences: sound, volume, effects, round limit
    ├── sound.ts        # sound effects (Web Audio API)
    ├── effects.ts      # particle effects (canvas)
    └── storage.ts      # safe localStorage wrapper
```

## Getting Started

`index.html` loads `src/ticTacToe.ts` as a module, so the project needs to be run via a dev server capable of processing TypeScript (such as Vite):

```bash
npm install
npm run dev
```

For production build:

```bash
npm run build
```

> Adjust the commands according to your project configuration.

## Technical Notes

- **Bot:** Minimax with alpha-beta pruning and center-first move ordering. The 3×3 board is solved completely (depth 9, making the bot unbeatable). The 5×5 board is capped at depth 4 and uses an `evaluate()` heuristic function to stay fast.
- **Winning lines** are dynamically generated by `buildLines(size, k)` for any board size and winning streak length.
- **Audio** only plays after user interaction (per browser autoplay policies), so the `AudioContext` is initialized on the first touch or keypress.
- **Effects** are automatically disabled when "Reduce motion" is enabled.

## Changelog

### v3 — Sound, Effects, and Round Limits

**Added**
- Web Audio sound effects (`sound.ts`) and canvas particle effects (`effects.ts`).
- Round limits (∞, 3, 5, 7, 10), round indicator, and match result dialog.
- **Game Settings** dialog (sound, volume, visual effects) and `prefs.ts` module.
- Win and loss animations: winning line, screen flash, board shake, and dimmed non-winning cells.
- Unified dialog handling (`openDialogEl`, `closeDialogEl`, `initDialogs`): clicking the backdrop or a `data-close-dialog` button closes the dialog.

**Changed**
- Scoreboard: player name and symbol are wrapped together in a single `.score-label`.
- Out-of-board WASD navigation now works inside any currently open dialog.
- Changing the round limit starts a new match and resets the score.

**Fixed**
- `evaluate()` in `game.ts`: opponent marks were previously counted as the bot's and one branch was unreachable, causing the 5×5 bot to evaluate positions in reverse. In simulations, the old bot lost 37 out of 40 rounds against the fixed version.
- `index.html`: stray `</span>` in the scoreboard and several untranslated strings.

### v2 — Accessibility and Language
- Accessibility dialog: colorblind modes, text size, high contrast, readable font, reduce motion.
- Dedicated ID/EN language toggle separate from the accessibility button, plus a restart game button.
- 5×5 board, mobile-responsive layout, keyboard navigation, and screen reader announcements.
- Code refactored into modular files (`game`, `i18n`, `setting`, `storage`).

### v1 — Initial Release
- 3×3 Tic Tac Toe against a bot with an aesthetic interface.

## Known Limitations

- Sound effects have been tested to ensure they throw no errors, but have not yet been auditioned across various physical devices.
- Not yet tested on physical mobile phones or with real screen readers (tested via browser emulation only).


