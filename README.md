# Game Tic-Tac-Toe

Proyek pribadi ini adalah game Tic-Tac-Toe interaktif yang dibangun sebagai sarana pembelajaran pemrograman menggunakan **TypeScript**. Game ini memungkinkan pemain untuk bermain melawan Bot dengan antarmuka yang modern dan responsif.

## Fitur Utama

- **Bermain Melawan Bot**: Bermain tic-tac-toe secara langsung melawan komputer.
- **Dua Tingkat Kesulitan**:
  - **Mudah**: Bot akan memilih kotak kosong secara acak.
  - **Sulit**: Bot ditenagai oleh **Algoritma Minimax**, membuatnya sangat cerdas dan mustahil untuk dikalahkan.
- **Papan Skor Dinamis**: Melacak jumlah Kemenangan (Kamu), Seri, dan Kekalahan (Bot) selama sesi permainan.
- **Sistem Giliran Adil**: Bot dan Pemain akan bergantian mengambil giliran pertama setiap kali ronde baru dimulai.
- **Desain Modern (Glassmorphism)**: Antarmuka pengguna dirancang dengan efek kaca (*backdrop-filter blur*), gradien warna yang halus, dan animasi dinamis saat pemain menang atau menekan tombol.
- **Aksesibilitas (A11y)**: Dilengkapi dengan atribut `aria-label` dan `role` agar lebih ramah bagi pengguna *screen reader*.

## Teknologi yang Digunakan

- **HTML5**: Kerangka dasar dan semantik web.
- **CSS3**: Tata letak menggunakan Grid & Flexbox, Variabel CSS (Custom Properties), Animasi Keyframes, dan efek UI modern.
- **TypeScript**: Logika inti permainan, manipulasi DOM yang aman (dengan *Type Checking*), dan implementasi algoritma pencarian langkah terbaik (Minimax).

## Cara Menjalankan Proyek

Karena proyek ini menggunakan TypeScript, pastikan file `.ts` dikompilasi menjadi `.js` agar bisa dijalankan di browser.

1. **Clone repository ini** ke komputer lokal kamu:
   ```bash
   git clone [https://github.com/deren849/game-tic-tac-toe.git](https://github.com/deren849/game-tic-tac-toe.git)
