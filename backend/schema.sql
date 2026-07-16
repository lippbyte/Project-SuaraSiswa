-- Create database if not exists
CREATE DATABASE IF NOT EXISTS susi;
USE susi;

-- Table for Posts (Diskusi, Musyawarah, Demos, Laporan)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'diskusi', 'musyawarah', 'demos', 'laporan'
    category VARCHAR(50) NOT NULL, -- 'lingkungan', 'akademik', 'kegiatan', 'fasilitas', 'sosial'
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    sender VARCHAR(100) NOT NULL,
    class VARCHAR(50) NULL,
    vote INT DEFAULT 0,
    time VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Replies (specifically for 'diskusi' posts)
CREATE TABLE IF NOT EXISTS replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    sender VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    vote INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table for Agenda Items (specifically for 'musyawarah' posts)
CREATE TABLE IF NOT EXISTS agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    task VARCHAR(255) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table for Participants (specifically for 'musyawarah' posts)
CREATE TABLE IF NOT EXISTS peserta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    keterangan TINYINT(1) DEFAULT 1, -- 1 = hadir, 0 = tidak hadir
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table for Polling Options (specifically for 'demos' posts)
CREATE TABLE IF NOT EXISTS poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    currentVotes INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table for Buku Tamu (Guest Book)
CREATE TABLE IF NOT EXISTS buku_tamu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Guest Votes (Anti-Spam Polling & Undo Support)
CREATE TABLE IF NOT EXISTS guest_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    post_id INT NOT NULL,
    option_id INT NULL, -- NULL for direct post votes (upvote post), value for poll option votes
    type ENUM('upvote', 'poll') NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES buku_tamu(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (guest_id, post_id, option_id)
);

-- Table for Activity Logs (Live Activity Feed)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_class VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,    -- 'vote', 'unvote', 'poll', 'unpoll', 'reply', 'post', 'delete'
    target VARCHAR(255) NOT NULL,   -- Deskripsi target, misal: "Kebersihan Lingkungan Sekolah"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- SEED DATA (Based on your original data.json)
-- =======================================================

-- Clear existing data (optional, for safety during re-runs)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE poll_options;
TRUNCATE TABLE peserta;
TRUNCATE TABLE agenda;
TRUNCATE TABLE replies;
TRUNCATE TABLE posts;
TRUNCATE TABLE buku_tamu;
TRUNCATE TABLE guest_votes;
TRUNCATE TABLE activity_logs;
SET FOREIGN_KEY_CHECKS = 1;


-- 1. Insert Posts
INSERT INTO posts (id, type, category, title, text, sender, class, vote, time) VALUES
(1, 'diskusi', 'lingkungan', 'Kebersihan Lingkungan Sekolah', 'Bagaimana pendapat kalian mengenai jadwal piket baru yang akan diterapkan mulai minggu depan?', 'Andi Perkasa', 'XII-IPA-1', 150, '12:40'),
(2, 'musyawarah', 'kegiatan', 'Rapat Evaluasi Ekstrakurikuler', 'Pembahasan mengenai efektivitas kegiatan setelah jam sekolah.', 'OSIS', NULL, 100, '14:00'),
(3, 'demos', 'fasilitas', 'Pilihan Menu Kantin Baru', 'Pilih menu yang paling kalian inginkan untuk tersedia di kantin bulan depan.', 'Kantin Sehat', NULL, 100, '09:00'),
(4, 'laporan', 'kegiatan', 'Laporan Kegiatan Pramuka', 'Pelaksanaan kemah Sabtu-Minggu berjalan lancar dengan partisipasi 90% anggota.', 'Pembina Pramuka', NULL, 15, '08:00'),
(5, 'diskusi', 'akademik', 'Penggunaan Gadget di Kelas', 'Apakah penggunaan tablet lebih efektif dibandingkan buku cetak untuk materi biologi?', 'Rina Wijaya', 'XI-IPA-2', 88, '10:15'),
(6, 'musyawarah', 'kegiatan', 'Penentuan Lokasi Study Tour', 'Menentukan antara Yogyakarta atau Malang untuk akhir tahun ajaran.', 'Panitia Kelas', NULL, 210, '15:30'),
(7, 'demos', 'fasilitas', 'Desain Kaos Olahraga Baru', 'Vote desain yang paling keren untuk seragam olahraga tahun ini.', 'Kesiswaan', NULL, 350, '11:00'),
(8, 'laporan', 'sosial', 'Hasil Donasi Bencana Alam', 'Total dana terkumpul Rp 5.000.000 dan telah disalurkan melalui Palang Merah.', 'PMR Sekolah', NULL, 45, '16:45'),
(9, 'diskusi', 'akademik', 'Persiapan Ujian Akhir', 'Butuh rekomendasi platform belajar online yang gratis dan lengkap.', 'Fajar Shidiq', 'XII-IPS-1', 67, '19:20'),
(10, 'musyawarah', 'fasilitas', 'Perbaikan Fasilitas Lab Komputer', 'Membahas penggantian mouse dan keyboard yang sudah rusak.', 'Kepala Lab', NULL, 30, '07:30');

-- 2. Insert Replies for Diskusi 1, 5, 9
INSERT INTO replies (post_id, sender, class, text, vote) VALUES
(1, 'Budi Utomo', 'XII-IPS-2', 'Saya setuju, asalkan pembagian waktunya adil untuk yang ekskul.', 12),
(1, 'Siti Aminah', 'XI-IPA-3', 'Mungkin bisa ditambah poin untuk yang paling rajin?', 45),
(1, 'Rakan Shaka', 'XII-IPA-2', 'Jadwal piket ini sangat fleksibel, aku harap dapat berjalan dengan baik.', 20),
(1, 'Khaffa Daru Hastri', 'XII-IPA-2', 'Pembagian piket harus menyesuaikan dengan kegiatan masing-masing murid.', 20),
(5, 'Dedi K.', 'XI-IPA-2', 'Tablet lebih ringkas, tapi distrasinya banyak.', 5),
(9, 'Lani', 'XII-IPA-1', 'Coba cek YouTube channel khusus edukasi, banyak yang bagus.', 22);

-- 3. Insert Agenda for Musyawarah 2, 6, 10
INSERT INTO agenda (post_id, task) VALUES
(2, 'Pembukaan oleh kepala sekolah.'),
(2, 'Membahas kepentingan kegiatan ekstrakurikuler.'),
(2, 'Sesi voting pendapat.'),
(2, 'Pembulatan keputusan.'),
(6, 'Presentasi biaya perjalanan.'),
(6, 'Perbandingan objek wisata.'),
(6, 'Voting suara terbanyak.'),
(10, 'Cek inventaris rusak.'),
(10, 'Pengajuan anggaran ke sekolah.'),
(10, 'Penjadwalan instalasi.');

-- 4. Insert Peserta for Musyawarah 2, 6, 10
INSERT INTO peserta (post_id, name, role, keterangan) VALUES
(2, 'Andi', 'Ketua', 1),
(2, 'Budi', 'Sekretaris', 1),
(2, 'Siti', 'Bendahara', 0),
(6, 'Hendra', 'Koordinator', 1),
(6, 'Siska', 'Admin', 1),
(10, 'Pak Mulyadi', 'Teknisi', 1),
(10, 'Bu Ratna', 'Kepala Lab', 1);

-- 5. Insert Options for Demos 3, 7
INSERT INTO poll_options (post_id, label, currentVotes) VALUES
(3, 'Nasi Bakar Ayam', 65),
(3, 'Mie Aceh Spesial', 20),
(3, 'Salad Buah Segar', 45),
(7, 'Neon Sporty', 120),
(7, 'Classic Blue', 230);


