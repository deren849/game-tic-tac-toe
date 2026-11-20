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

## Rencana

- Mode **AI Claude** sebagai lawan (membutuhkan server perantara agar API key tidak terbuka di frontend, dengan cadangan ke bot lokal). Belum dibuat.
