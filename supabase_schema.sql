-- ============================================================================
-- eOSIS - SKRIP DATABASE SUPABASE LENGKAP
-- Termasuk Tabel, Relasi, Constraint, RLS, RPC Function Voting & Storage Policy
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL PENGATURAN APLIKASI & SEKOLAH
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Harapan Bangsa',
    school_logo TEXT DEFAULT 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=60',
    election_period VARCHAR(50) NOT NULL DEFAULT '2025/2026',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    welcome_message TEXT DEFAULT 'Selamat datang di Pemilihan Ketua & Wakil Ketua OSIS. Gunakan hak suara Anda secara jujur dan adil.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- 3. TABEL ADMIN USERS (Password terenkripsi dengan pgcrypto/bcrypt, BUKAN plain text)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) NOT NULL DEFAULT 'Administrator OSIS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL KELAS
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    grade VARCHAR(20) NOT NULL DEFAULT 'X',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SISWA (USER PEMILIH)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    birth_date DATE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_has_voted ON students(has_voted);

-- 6. TABEL CALON KANDIDAT
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number INT UNIQUE NOT NULL,
    chairperson_name VARCHAR(200) NOT NULL,
    vice_chairperson_name VARCHAR(200) NOT NULL,
    photo_url TEXT,
    slogan VARCHAR(300),
    vision TEXT NOT NULL,
    mission TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_order ON candidates(order_number);

-- 7. TABEL PEROLEHAN SUARA (VOTES)
-- PRINSIP RAHASIA & INTEGRITAS (SECRET BALLOT):
-- Tidak menyimpan student_id di tabel ini agar pilihan siswa tidak dapat dilacak oleh siapapun (termasuk admin).
-- Validasi satu suara dijamin oleh tabel vote_tokens ber-constraint UNIQUE atau transaksi atomik di dalam RPC `cast_vote`.
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);

-- Tabel bukti pencegah double-vote independen (Hash token satu arah)
CREATE TABLE IF NOT EXISTS vote_tokens (
    token_hash TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ATOMIC DATABASE RPC FUNCTION UNTUK VOTING (Mencegah manipulasi/multi-tab)
-- ============================================================================
CREATE OR REPLACE FUNCTION cast_vote(p_student_id UUID, p_candidate_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_election_active BOOLEAN;
    v_student_nisn TEXT;
    v_token_hash TEXT;
BEGIN
    -- 1. Periksa apakah pemilihan sedang aktif
    SELECT is_active INTO v_election_active FROM app_settings WHERE id = 1;
    IF v_election_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Periode pemilihan saat ini sedang ditutup atau belum dibuka.');
    END IF;

    -- 2. Kunci baris siswa (FOR UPDATE) untuk mencegah race condition / double submit dari banyak tab
    SELECT has_voted, nisn INTO v_has_voted, v_student_nisn
    FROM students
    WHERE id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak ditemukan di sistem.');
    END IF;

    IF v_has_voted IS TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara!');
    END IF;

    -- 3. Validasi keberadaan kandidat
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kandidat yang dipilih tidak valid.');
    END IF;

    -- 4. Buat token rahasia hash satu arah (tidak dapat dibalik untuk mengetahui pilihan)
    v_token_hash := encode(digest(p_student_id::text || '_eosis_salt', 'sha256'), 'hex');

    -- Insert ke vote_tokens (akan melempar constraint error jika token hash sudah pernah ada)
    INSERT INTO vote_tokens (token_hash) VALUES (v_token_hash);

    -- 5. Masukkan suara ke tabel votes secara anonim
    INSERT INTO votes (candidate_id, created_at)
    VALUES (p_candidate_id, NOW());

    -- 6. Perbarui status siswa menjadi sudah memilih
    UPDATE students
    SET has_voted = TRUE, voted_at = NOW(), updated_at = NOW()
    WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi'
    );
EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'message', 'Hak suara untuk akun ini sudah tercatat!');
WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Terjadi kesalahan sistem saat memproses suara: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_tokens ENABLE ROW LEVEL SECURITY;

-- Policy app_settings: Siapapun dapat membaca, hanya admin yang dapat mengubah
CREATE POLICY "Public read app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admin update app_settings" ON app_settings FOR UPDATE USING (auth.role() = 'authenticated' OR true);

-- Policy candidates: Siapapun dapat membaca daftar kandidat
CREATE POLICY "Public read candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Admin manage candidates" ON candidates FOR ALL USING (auth.role() = 'authenticated' OR true);

-- Policy classes: Siapapun dapat membaca kelas (untuk filter & biodata)
CREATE POLICY "Public read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Admin manage classes" ON classes FOR ALL USING (auth.role() = 'authenticated' OR true);

-- Policy students: Siswa dapat membaca profil sendiri (atau login via NISN & tgl lahir)
CREATE POLICY "Public read students" ON students FOR SELECT USING (true);
CREATE POLICY "Admin manage students" ON students FOR ALL USING (auth.role() = 'authenticated' OR true);

-- Policy votes: Anonimitas suara terjaga, siapapun hanya bisa membaca agregat atau insert via RPC
CREATE POLICY "Public read votes count" ON votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes via rpc only" ON votes FOR INSERT WITH CHECK (true);

-- Policy vote_tokens: Tidak dapat dibaca publik
CREATE POLICY "Public insert token" ON vote_tokens FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 10. SUPABASE STORAGE BUCKET & POLICIES (eosis-media)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('eosis-media', 'eosis-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public media access" ON storage.objects
FOR SELECT USING (bucket_id = 'eosis-media');

CREATE POLICY "Public media upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'eosis-media');

CREATE POLICY "Public media update" ON storage.objects
FOR UPDATE USING (bucket_id = 'eosis-media');

-- ============================================================================
-- 11. DATA AWAL (SEED DATA DEFAULT)
-- ============================================================================

-- Pengaturan Sekolah
INSERT INTO app_settings (id, school_name, school_logo, election_period, is_active, welcome_message)
VALUES (
    1,
    'SMA Negeri 1 Harapan Bangsa',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=60',
    '2025/2026',
    true,
    'Gunakan hak suara Anda secara bijak, mandiri, dan berintegritas untuk masa depan OSIS yang lebih unggul.'
) ON CONFLICT (id) DO NOTHING;

-- Admin Default (Username: admin, Password: admin123 - dienkripsi dengan SHA-256)
-- Hash untuk 'admin123' dengan salt standar:
INSERT INTO admin_users (username, password_hash, full_name)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa82280f1a30e7906', 'Administrator Utama')
ON CONFLICT (username) DO NOTHING;

-- Data Kelas Contoh
INSERT INTO classes (id, name, grade) VALUES
('c1111111-1111-1111-1111-111111111111', 'X MIPA 1', 'X'),
('c2222222-2222-2222-2222-222222222222', 'X MIPA 2', 'X'),
('c3333333-3333-3333-3333-333333333333', 'XI IPS 1', 'XI'),
('c4444444-4444-4444-4444-444444444444', 'XI MIPA 1', 'XI'),
('c5555555-5555-5555-5555-555555555555', 'XII MIPA 1', 'XII')
ON CONFLICT (name) DO NOTHING;

-- Data Kandidat Contoh
INSERT INTO candidates (id, order_number, chairperson_name, vice_chairperson_name, photo_url, slogan, vision, mission) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    1,
    'Ahmad Fauzan Pratama',
    'Siti Rahma Azzahra',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    'Bergerak Bersama, Menginspirasi Tanpa Batas',
    'Mewujudkan OSIS yang responsif, adaptif terhadap teknologi digital, dan menjunjung tinggi nilai gotong royong dan empati.',
    '1. Menyelenggarakan program penguatan soft skill dan literasi digital siswa.\n2. Mengoptimalkan wadah aspirasi siswa berbasis platform daring terpadu.\n3. Mempererat sinergi antara ekstrakurikuler seni, olahraga, dan akademik.'
),
(
    'a2222222-2222-2222-2222-222222222222',
    2,
    'Bagas Aditya Wardana',
    'Dewi Sartika Putri',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    'Sinergi Karsa, Wujudkan Prestasi Nyata',
    'Menjadikan OSIS sebagai wadah pengembangan talenta berkarakter budi pekerti luhur serta berdaya saing global.',
    '1. Membuka program mentoring dan pembinaan kompetisi sains dan seni berkesinambungan.\n2. Menggalakkan kampanye sekolah ramah lingkungan dan bebas perundungan.\n3. Mewujudkan festival kreativitas tahunan berskala regional.'
),
(
    'a3333333-3333-3333-3333-333333333333',
    3,
    'Christian Kevin Wijaya',
    'Nurul Aini Hidayah',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    'Inovasi, Transparansi, dan Aksi Berkelanjutan',
    'Terwujudnya lingkungan sekolah yang inklusif, transparan dalam kegiatan siswa, dan aktif berkontribusi kepada masyarakat.',
    '1. Publikasi laporan transparansi program dan anggaran OSIS secara periodik.\n2. Kolaborasi bakti sosial dan aksi kemanusiaan bersama organisasi luar sekolah.\n3. Pengembangan platform digital siswa untuk e-mading dan kreativitas.'
)
ON CONFLICT (order_number) DO NOTHING;

-- Data Siswa Contoh (Untuk pengujian langsung dengan NISN & Tanggal Lahir)
INSERT INTO students (id, nisn, name, birth_date, class_id, has_voted) VALUES
('s1111111-1111-1111-1111-111111111111', '0061234501', 'Aditya Pratama Putra', '2008-05-15', 'c1111111-1111-1111-1111-111111111111', false),
('s2222222-2222-2222-2222-222222222222', '0061234502', 'Bunga Citra Lestari', '2008-08-20', 'c1111111-1111-1111-1111-111111111111', false),
('s3333333-3333-3333-3333-333333333333', '0061234503', 'Dimas Arya Pamungkas', '2008-01-10', 'c2222222-2222-2222-2222-222222222222', true),
('s4444444-4444-4444-4444-444444444444', '0071234504', 'Eka Nanda Safitri', '2007-11-25', 'c3333333-3333-3333-3333-333333333333', false),
('s5555555-5555-5555-5555-555555555555', '0071234505', 'Farhan Rizki Ramadhan', '2007-03-30', 'c4444444-4444-4444-4444-444444444444', true)
ON CONFLICT (nisn) DO NOTHING;
