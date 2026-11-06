# Game Tic-Tac-Toe

Proyek pribadi ini adalah game Tic-Tac-Toe interaktif yang dibangun sebagai sarana pembelajaran pemrograman web front-end. Game ini memungkinkan pemain untuk bermain melawan Bot dengan antarmuka yang modern, responsif, modular, dan sangat inklusif.

## Fitur Utama

- **Bermain Melawan Bot**: Bermain tic-tac-toe secara langsung melawan komputer dengan sistem giliran yang adil (bergantian mengambil giliran pertama di ronde baru).
- **Dua Pilihan Ukuran Papan**: 
  - **3x3**: Susun 3 tanda berjajar untuk menang.
  - **5x5**: Susun 4 tanda berjajar untuk menang.
- **Tingkat Kesulitan Bot**:
  - **Mudah**: Bot akan memilih kotak kosong secara acak.
  - **Sulit**: Bot ditenagai oleh **Algoritma Minimax**, membuatnya sangat cerdas dan mustahil untuk dikalahkan.
- **Dukungan Dwibahasa (i18n)**: Tersedia dalam Bahasa Indonesia (ID) dan Bahasa Inggris (EN) dengan deteksi bahasa otomatis.
- **Papan Skor Dinamis**: Melacak jumlah Kemenangan (Kamu), Seri, dan Kekalahan (Bot) selama sesi permainan berlangsung.
- **Penyimpanan Lokal**: Pengaturan bahasa dan aksesibilitas akan otomatis tersimpan di *local storage* browser.

## ♿ Aksesibilitas (A11y) Terdepan
Game ini dirancang agar dapat dimainkan oleh siapa saja, dengan menghadirkan menu aksesibilitas khusus:
- **Mode Warna**: Dukungan skema warna khusus untuk buta warna merah-hijau (Protanopia/Deuteranopia), biru-kuning (Tritanopia), dan mode monokrom. Bentuk X dan O selalu berbeda agar tidak hanya mengandalkan warna.
- **Tampilan Kustom**: Opsi Kontras Tinggi, ukuran teks yang bisa diperbesar, opsi *font* yang mudah dibaca, serta mode untuk mematikan animasi (*Reduce motion*).
- **Navigasi Keyboard Penuh**: Dapat dimainkan sepenuhnya menggunakan keyboard (WASD / Tombol Panah untuk navigasi papan, Spasi/Enter untuk memilih) dengan fokus penunjuk (*roving tabindex*) yang jelas.
- **Ramah Screen Reader**: Dilengkapi dengan atribut `aria-label`, `role`, dan `aria-live` sehingga setiap langkah akan dibacakan oleh pembaca layar.

## Teknologi yang Digunakan

- **HTML5**: Kerangka dasar dan semantik web yang kuat.
- **CSS3**: Tata letak menggunakan Grid & Flexbox, Variabel CSS (Custom Properties) untuk tema dinamis, gaya *Glassmorphism* (efek kaca & *backdrop-filter blur*), dan animasi interaktif.
- **TypeScript & JavaScript (ES6 Modules)**: Logika inti permainan sepenuhnya ditulis menggunakan **TypeScript** untuk memanfaatkan *type safety*, panduan *interface*, dan struktur yang lebih bersih. File TypeScript tersebut kemudian dikompilasi menjadi JavaScript ES6 Modules (`game.js`, `ticTacToe.js`, `i18n.js`, dsb) untuk dijalankan secara native di browser.

## Cara Menjalankan Proyek

1. **Clone repository ini** ke komputer lokal kamu:
   ```bash
   git clone [https://github.com/deren849/game-tic-tac-toe.git](https://github.com/deren849/game-tic-tac-toe.git)

## Cara Menjalankan Proyek

1. **Clone repository ini** ke komputer lokal kamu:
   ```bash
   git clone [https://github.com/deren849/game-tic-tac-toe.git](https://github.com/deren849/game-tic-tac-toe.git)
