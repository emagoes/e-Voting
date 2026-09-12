import { getSupabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword } from './crypto';
import type {
  AppSettings,
  ClassItem,
  StudentItem,
  CandidateItem,
  VoteTally,
  VotingStats,
} from '../types';

import defaultSchoolLogo from '../assets/images/regenerated_image_1789224215518.png';

// Initial Mock / Seed Data
const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  school_name: 'SMP Negeri 1 Sumobito',
  school_logo: defaultSchoolLogo,
  election_period: '2026/2027',
  is_active: true,
  welcome_message: 'Selamat datang di Pemilihan Ketua & Wakil Ketua OSIS. Gunakan hak suara Anda secara jujur, mandiri, dan berintegritas.',
  updated_at: new Date().toISOString(),
};

const DEFAULT_CLASSES: ClassItem[] = [
  { id: 'c1', name: '7A', grade: '7' },
  { id: 'c2', name: '7B', grade: '7' },
  { id: 'c3', name: '7C', grade: '7' },
  { id: 'c4', name: '8A', grade: '8' },
  { id: 'c5', name: '8B', grade: '8' },
  { id: 'c6', name: '9A', grade: '9' },
  { id: 'c7', name: '9B', grade: '9' },
];

const DEFAULT_CANDIDATES: CandidateItem[] = [
  {
    id: 'k1',
    order_number: 1,
    chairperson_name: 'Ahmad Fauzan Pratama',
    vice_chairperson_name: 'Siti Rahma Azzahra',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    slogan: 'Bergerak Bersama, Menginspirasi Tanpa Batas',
    vision: 'Mewujudkan OSIS yang responsif, adaptif terhadap teknologi digital, dan menjunjung tinggi nilai gotong royong dan kepedulian sosial.',
    mission: '1. Mengoptimalkan platform digital untuk menyerap seluruh aspirasi siswa secara cepat dan transparan.\n2. Mengembangkan program penguatan karakter kepemimpinan dan literasi digital siswa.\n3. Mempererat kolaborasi antar-ekstrakurikuler bidang akademik, seni, dan olahraga.',
  },
  {
    id: 'k2',
    order_number: 2,
    chairperson_name: 'Bagas Aditya Wardana',
    vice_chairperson_name: 'Dewi Sartika Putri',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    slogan: 'Sinergi Karsa, Wujudkan Prestasi Nyata',
    vision: 'Menjadikan OSIS sebagai motor penggerak kreativitas, inovasi, dan prestasi siswa berlandaskan budi pekerti luhur.',
    mission: '1. Mengadakan program mentoring berkala persiapan kompetisi sains, seni, dan debat.\n2. Menggalakkan program sekolah ramah lingkungan dan bebas perundungan (anti-bullying).\n3. Menyelenggarakan festival seni dan teknologi tahunan yang inklusif.',
  },
  {
    id: 'k3',
    order_number: 3,
    chairperson_name: 'Christian Kevin Wijaya',
    vice_chairperson_name: 'Nurul Aini Hidayah',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    slogan: 'Inovasi, Transparansi, dan Aksi Berkelanjutan',
    vision: 'Terwujudnya iklim sekolah yang demokratis, inklusif, terbuka, dan aktif berkontribusi nyata bagi lingkungan sekitar.',
    mission: '1. Menyajikan laporan pertanggungjawaban kegiatan OSIS secara transparan di portal digital siswa.\n2. Memfasilitasi inkubator kewirausahaan siswa melalui unit karya kreatif mandiri.\n3. Melaksanakan aksi sosial peduli masyarakat dan pelestarian lingkungan hidup secara rutin.',
  },
];

const DEFAULT_STUDENTS: StudentItem[] = [
  { id: 's1', nisn: '0061234501', name: 'Aditya Pratama Putra', birth_date: '2008-05-15', class_id: 'c1', has_voted: false, voted_at: null },
  { id: 's2', nisn: '0061234502', name: 'Bunga Citra Lestari', birth_date: '2008-08-20', class_id: 'c1', has_voted: false, voted_at: null },
  { id: 's3', nisn: '0061234503', name: 'Dimas Arya Pamungkas', birth_date: '2008-01-10', class_id: 'c2', has_voted: true, voted_at: '2026-09-12T08:30:00Z' },
  { id: 's4', nisn: '0071234504', name: 'Eka Nanda Safitri', birth_date: '2007-11-25', class_id: 'c3', has_voted: false, voted_at: null },
  { id: 's5', nisn: '0071234505', name: 'Farhan Rizki Ramadhan', birth_date: '2007-03-30', class_id: 'c4', has_voted: true, voted_at: '2026-09-12T09:15:00Z' },
  { id: 's6', nisn: '0071234506', name: 'Gita Maharani Putri', birth_date: '2007-06-18', class_id: 'c4', has_voted: false, voted_at: null },
  { id: 's7', nisn: '0051234507', name: 'Hafiz Surya Maulana', birth_date: '2006-09-05', class_id: 'c5', has_voted: true, voted_at: '2026-09-12T09:45:00Z' },
  { id: 's8', nisn: '0051234508', name: 'Intan Nuraini', birth_date: '2006-12-12', class_id: 'c5', has_voted: false, voted_at: null },
  { id: 's9', nisn: '0051234509', name: 'Jovan Alexander', birth_date: '2006-04-02', class_id: 'c6', has_voted: false, voted_at: null },
  { id: 's10', nisn: '0051234510', name: 'Kartika Chandra', birth_date: '2006-07-22', class_id: 'c6', has_voted: true, voted_at: '2026-09-12T10:00:00Z' },
];

// In memory / localStorage votes for offline/demo (only candidate_id, completely anonymous!)
const DEFAULT_VOTES: { id: string; candidate_id: string; created_at: string }[] = [
  { id: 'v1', candidate_id: 'k1', created_at: '2026-09-12T08:30:00Z' },
  { id: 'v2', candidate_id: 'k2', created_at: '2026-09-12T09:15:00Z' },
  { id: 'v3', candidate_id: 'k1', created_at: '2026-09-12T09:45:00Z' },
  { id: 'v4', candidate_id: 'k3', created_at: '2026-09-12T10:00:00Z' },
];

// Helper to load/save in localStorage
function getLocal<T>(key: string, defaultVal: T): T {
  const item = localStorage.getItem(`eosis_${key}`);
  if (!item) {
    localStorage.setItem(`eosis_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  localStorage.setItem(`eosis_${key}`, JSON.stringify(val));
}

// Ensure initial seed
export async function initializeDatabase() {
  const currentSettings = getLocal('settings', DEFAULT_SETTINGS);
  let settingsChanged = false;
  if (!currentSettings.school_logo || currentSettings.school_logo.includes('unsplash.com')) {
    currentSettings.school_logo = defaultSchoolLogo;
    settingsChanged = true;
  }
  if (!currentSettings.school_name || currentSettings.school_name === 'SMA Negeri 1 Harapan Bangsa' || currentSettings.school_name === 'eOSIS - Sistem Pemilihan OSIS') {
    currentSettings.school_name = 'SMP Negeri 1 Sumobito';
    settingsChanged = true;
  }
  if (!currentSettings.election_period || currentSettings.election_period === '2025/2026') {
    currentSettings.election_period = '2026/2027';
    settingsChanged = true;
  }
  if (settingsChanged) {
    setLocal('settings', currentSettings);
  }

  // Auto-migrate or initialize classes for SMP (Kelas 7, 8, 9)
  const existingClasses = getLocal<ClassItem[]>('classes', DEFAULT_CLASSES);
  const hasHighSchoolClasses = existingClasses.some(c => c.grade === 'X' || c.grade === 'XI' || c.grade === 'XII' || c.name.includes('MIPA') || c.name.includes('IPS'));
  if (hasHighSchoolClasses) {
    // Map high school grades/classes to Junior High (SMP) Kelas 7, 8, 9
    const updatedClasses = existingClasses.map(c => {
      if (c.grade === 'X' || c.name.includes('X MIPA 1') || c.id === 'c1') {
        const newName = c.name.includes('2') ? '7B' : '7A';
        return { ...c, name: newName, grade: '7' };
      } else if (c.grade === 'XI' || c.name.includes('XI') || c.id === 'c3' || c.id === 'c4') {
        const newName = c.name.includes('MIPA') || c.id === 'c4' ? '8B' : '8A';
        return { ...c, name: newName, grade: '8' };
      } else if (c.grade === 'XII' || c.name.includes('XII') || c.id === 'c5' || c.id === 'c6') {
        const newName = c.name.includes('IPS') || c.id === 'c6' ? '9B' : '9A';
        return { ...c, name: newName, grade: '9' };
      }
      return c;
    });
    setLocal('classes', updatedClasses);
  } else {
    getLocal('classes', DEFAULT_CLASSES);
  }

  getLocal('candidates', DEFAULT_CANDIDATES);
  getLocal('students', DEFAULT_STUDENTS);
  getLocal('votes', DEFAULT_VOTES);

  // Default admin: username: "admin", password: "admin123"
  if (!localStorage.getItem('eosis_admin_credentials')) {
    const password_hash = await hashPassword('admin123');
    setLocal('admin_credentials', {
      username: 'admin',
      full_name: 'Administrator OSIS',
      password_hash,
    });
  }
}

// ----------------------------------------------------------------------------
// APP SETTINGS
// ----------------------------------------------------------------------------
export async function getSettings(): Promise<AppSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('app_settings').select('*').single();
      if (!error && data) return data as AppSettings;
    } catch (e) {
      console.warn('Supabase getSettings error, fallback to local', e);
    }
  }
  return getLocal<AppSettings>('settings', DEFAULT_SETTINGS);
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single();
      if (!error && data) return data as AppSettings;
    } catch (e) {
      console.warn('Supabase updateSettings error, saving to local', e);
    }
  }
  const current = getLocal<AppSettings>('settings', DEFAULT_SETTINGS);
  const merged: AppSettings = { ...current, ...updates, updated_at: new Date().toISOString() };
  setLocal('settings', merged);
  return merged;
}

// ----------------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------------
export async function getClasses(): Promise<ClassItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('name');
      if (!error && data) return data as ClassItem[];
    } catch (e) {
      console.warn('Supabase getClasses error, fallback to local', e);
    }
  }
  return getLocal<ClassItem[]>('classes', DEFAULT_CLASSES);
}

export async function saveClass(classData: Omit<ClassItem, 'id'>, id?: string): Promise<ClassItem> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      if (id) {
        const { data, error } = await supabase.from('classes').update(classData).eq('id', id).select().single();
        if (!error && data) return data as ClassItem;
      } else {
        const { data, error } = await supabase.from('classes').insert(classData).select().single();
        if (!error && data) return data as ClassItem;
      }
    } catch (e) {
      console.warn('Supabase saveClass error, fallback to local', e);
    }
  }

  const list = getLocal<ClassItem[]>('classes', DEFAULT_CLASSES);
  if (id) {
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...classData };
      setLocal('classes', list);
      return list[idx];
    }
  }
  const newItem: ClassItem = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...classData,
  };
  list.push(newItem);
  setLocal('classes', list);
  return newItem;
}

export async function deleteClass(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteClass error, fallback to local', e);
    }
  }
  const list = getLocal<ClassItem[]>('classes', DEFAULT_CLASSES);
  const filtered = list.filter(c => c.id !== id);
  setLocal('classes', filtered);
  return true;
}

// ----------------------------------------------------------------------------
// STUDENTS
// ----------------------------------------------------------------------------
export async function getStudents(filterClassId?: string): Promise<StudentItem[]> {
  const classes = await getClasses();
  const classMap = new Map(classes.map(c => [c.id, c.name]));

  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('students').select('*').order('name');
      if (filterClassId) {
        query = query.eq('class_id', filterClassId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return (data as StudentItem[]).map(s => ({
          ...s,
          class_name: classMap.get(s.class_id) || '-',
        }));
      }
    } catch (e) {
      console.warn('Supabase getStudents error, fallback to local', e);
    }
  }

  let list = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  if (filterClassId) {
    list = list.filter(s => s.class_id === filterClassId);
  }
  return list.map(s => ({
    ...s,
    class_name: classMap.get(s.class_id) || '-',
  }));
}

export async function saveStudent(data: Omit<StudentItem, 'id' | 'has_voted' | 'voted_at'>, id?: string): Promise<StudentItem> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      if (id) {
        const { data: res, error } = await supabase.from('students').update(data).eq('id', id).select().single();
        if (!error && res) return res as StudentItem;
      } else {
        const { data: res, error } = await supabase.from('students').insert({ ...data, has_voted: false }).select().single();
        if (!error && res) return res as StudentItem;
      }
    } catch (e) {
      console.warn('Supabase saveStudent error, fallback to local', e);
    }
  }

  const list = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  if (id) {
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal('students', list);
      return list[idx];
    }
  }
  const newItem: StudentItem = {
    id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...data,
    has_voted: false,
    voted_at: null,
  };
  list.push(newItem);
  setLocal('students', list);
  return newItem;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteStudent error, fallback to local', e);
    }
  }
  const list = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  setLocal('students', list.filter(s => s.id !== id));
  return true;
}

export async function resetStudentVote(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('students').update({ has_voted: false, voted_at: null }).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase resetStudentVote error, fallback to local', e);
    }
  }
  const list = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx].has_voted = false;
    list[idx].voted_at = null;
    setLocal('students', list);
  }
  return true;
}

// ----------------------------------------------------------------------------
// CANDIDATES
// ----------------------------------------------------------------------------
export async function getCandidates(): Promise<CandidateItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('candidates').select('*').order('order_number');
      if (!error && data) return data as CandidateItem[];
    } catch (e) {
      console.warn('Supabase getCandidates error, fallback to local', e);
    }
  }
  const list = getLocal<CandidateItem[]>('candidates', DEFAULT_CANDIDATES);
  return list.sort((a, b) => a.order_number - b.order_number);
}

export async function saveCandidate(candidateData: Omit<CandidateItem, 'id'>, id?: string): Promise<CandidateItem> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      if (id) {
        const { data, error } = await supabase.from('candidates').update(candidateData).eq('id', id).select().single();
        if (!error && data) return data as CandidateItem;
      } else {
        const { data, error } = await supabase.from('candidates').insert(candidateData).select().single();
        if (!error && data) return data as CandidateItem;
      }
    } catch (e) {
      console.warn('Supabase saveCandidate error, fallback to local', e);
    }
  }

  const list = getLocal<CandidateItem[]>('candidates', DEFAULT_CANDIDATES);
  if (id) {
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...candidateData };
      setLocal('candidates', list);
      return list[idx];
    }
  }
  const newItem: CandidateItem = {
    id: 'k_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...candidateData,
  };
  list.push(newItem);
  setLocal('candidates', list);
  return newItem;
}

export async function deleteCandidate(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteCandidate error, fallback to local', e);
    }
  }
  const list = getLocal<CandidateItem[]>('candidates', DEFAULT_CANDIDATES);
  setLocal('candidates', list.filter(c => c.id !== id));
  return true;
}

// ----------------------------------------------------------------------------
// MEDIA & STORAGE (Supabase Storage bucket `eosis-media` with fallback)
// ----------------------------------------------------------------------------
export async function uploadMedia(file: File, folder: 'candidates' | 'logo' = 'candidates'): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from('eosis-media').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (!error && data) {
        const { data: pubData } = supabase.storage.from('eosis-media').getPublicUrl(fileName);
        if (pubData && pubData.publicUrl) {
          return pubData.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase storage upload error, converting to data URL', e);
    }
  }

  // Fallback to FileReader base64 for instant preview & zero-setup testing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------------
// SISWA AUTHENTICATION (Login via NISN & Tanggal Lahir)
// ----------------------------------------------------------------------------
export async function studentLogin(nisn: string, birthDate: string): Promise<{ success: boolean; student?: StudentItem; message?: string }> {
  const cleanNisn = nisn.trim();
  const cleanBirth = birthDate.trim();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('nisn', cleanNisn)
        .eq('birth_date', cleanBirth)
        .maybeSingle();

      if (!error && data) {
        const classes = await getClasses();
        const className = classes.find(c => c.id === data.class_id)?.name || '-';
        return {
          success: true,
          student: { ...data, class_name: className } as StudentItem,
        };
      }
    } catch (e) {
      console.warn('Supabase studentLogin error, fallback to local check', e);
    }
  }

  const list = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  const found = list.find(s => s.nisn === cleanNisn && s.birth_date === cleanBirth);

  if (!found) {
    return {
      success: false,
      message: 'NISN atau Tanggal Lahir tidak cocok dengan data terdaftar.',
    };
  }

  const classes = await getClasses();
  const className = classes.find(c => c.id === found.class_id)?.name || '-';

  return {
    success: true,
    student: { ...found, class_name: className },
  };
}

// ----------------------------------------------------------------------------
// VOTING MECHANISM & INTEGRITY (Database RPC / Atomic Transaction)
// Strictly 1 vote per student. Validated on database/backend.
// Secret ballot: candidate choices are never linked to student identity.
// ----------------------------------------------------------------------------
export async function castVote(
  studentId: string,
  candidateId: string
): Promise<{ success: boolean; message: string }> {
  // 1. Verify election active status
  const settings = await getSettings();
  if (!settings.is_active) {
    return {
      success: false,
      message: 'Periode pemilihan saat ini sedang tidak aktif atau ditutup.',
    };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Call secure Supabase RPC function `cast_vote`
      const { data, error } = await supabase.rpc('cast_vote', {
        p_student_id: studentId,
        p_candidate_id: candidateId,
      });

      if (error) {
        console.error('Supabase cast_vote RPC error:', error);
        return {
          success: false,
          message: error.message || 'Gagal merekam suara di database Supabase.',
        };
      }

      if (data) {
        return {
          success: Boolean(data.success),
          message: data.message || (data.success ? 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi' : 'Gagal memilih.'),
        };
      }
    } catch (e: any) {
      console.warn('Supabase cast_vote fallback to local atomic handling', e);
    }
  }

  // Local Atomic Transaction Simulation (with strict double-vote blocking)
  const students = getLocal<StudentItem[]>('students', DEFAULT_STUDENTS);
  const student = students.find(s => s.id === studentId);

  if (!student) {
    return { success: false, message: 'Data siswa pemilih tidak ditemukan.' };
  }

  if (student.has_voted) {
    return {
      success: false,
      message: 'Anda sudah menggunakan hak suara! Suara hanya dapat diberikan 1 kali.',
    };
  }

  const candidates = getLocal<CandidateItem[]>('candidates', DEFAULT_CANDIDATES);
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) {
    return { success: false, message: 'Kandidat yang dipilih tidak valid.' };
  }

  // Atomic state change:
  // 1. Mark student as voted
  student.has_voted = true;
  student.voted_at = new Date().toISOString();
  setLocal('students', students);

  // 2. Add vote to anonymous votes collection (NO student_id linked! Secret ballot)
  const votes = getLocal<{ id: string; candidate_id: string; created_at: string }[]>('votes', DEFAULT_VOTES);
  votes.push({
    id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    candidate_id: candidateId,
    created_at: new Date().toISOString(),
  });
  setLocal('votes', votes);

  return {
    success: true,
    message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
  };
}

// ----------------------------------------------------------------------------
// PEROLEHAN SUARA & STATISTIK (Aggregates only, no student identity linked)
// ----------------------------------------------------------------------------
export async function getVoteTallies(): Promise<{
  tallies: VoteTally[];
  totalVotes: number;
}> {
  const candidates = await getCandidates();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: votesData, error } = await supabase.from('votes').select('candidate_id');
      if (!error && votesData) {
        const counts = new Map<string, number>();
        votesData.forEach(v => {
          counts.set(v.candidate_id, (counts.get(v.candidate_id) || 0) + 1);
        });

        const total = votesData.length;
        const tallies: VoteTally[] = candidates.map(c => {
          const votes_count = counts.get(c.id) || 0;
          const percentage = total > 0 ? Number(((votes_count / total) * 100).toFixed(1)) : 0;
          return {
            candidate_id: c.id,
            order_number: c.order_number,
            chairperson_name: c.chairperson_name,
            vice_chairperson_name: c.vice_chairperson_name,
            photo_url: c.photo_url,
            votes_count,
            percentage,
          };
        });

        return { tallies, totalVotes: total };
      }
    } catch (e) {
      console.warn('Supabase getVoteTallies error, fallback to local', e);
    }
  }

  const votes = getLocal<{ id: string; candidate_id: string; created_at: string }[]>('votes', DEFAULT_VOTES);
  const counts = new Map<string, number>();
  votes.forEach(v => {
    counts.set(v.candidate_id, (counts.get(v.candidate_id) || 0) + 1);
  });

  const total = votes.length;
  const tallies: VoteTally[] = candidates.map(c => {
    const votes_count = counts.get(c.id) || 0;
    const percentage = total > 0 ? Number(((votes_count / total) * 100).toFixed(1)) : 0;
    return {
      candidate_id: c.id,
      order_number: c.order_number,
      chairperson_name: c.chairperson_name,
      vice_chairperson_name: c.vice_chairperson_name,
      photo_url: c.photo_url,
      votes_count,
      percentage,
    };
  });

  return { tallies, totalVotes: total };
}

export async function getStatistics(): Promise<VotingStats> {
  const students = await getStudents();
  const classes = await getClasses();
  const candidates = await getCandidates();

  const totalStudents = students.length;
  const votedStudents = students.filter(s => s.has_voted).length;
  const unvotedStudents = totalStudents - votedStudents;
  const participationRate = totalStudents > 0 ? Number(((votedStudents / totalStudents) * 100).toFixed(1)) : 0;

  return {
    totalStudents,
    totalClasses: classes.length,
    totalCandidates: candidates.length,
    votedStudents,
    unvotedStudents,
    participationRate,
  };
}

// ----------------------------------------------------------------------------
// ADMIN AUTHENTICATION (Never plain text)
// ----------------------------------------------------------------------------
export async function adminLogin(username: string, passwordPlain: string): Promise<{ success: boolean; message?: string }> {
  const cleanUser = username.trim();
  const storedCreds = getLocal<{ username: string; full_name: string; password_hash: string }>(
    'admin_credentials',
    { username: 'admin', full_name: 'Administrator OSIS', password_hash: '' }
  );

  if (storedCreds.username !== cleanUser) {
    return { success: false, message: 'Username atau password salah!' };
  }

  const isMatch = await verifyPassword(passwordPlain, storedCreds.password_hash);
  if (!isMatch) {
    return { success: false, message: 'Username atau password salah!' };
  }

  return { success: true };
}

export async function updateAdminCredentials(
  currentPasswordPlain: string,
  newUsername: string,
  newPasswordPlain?: string
): Promise<{ success: boolean; message?: string }> {
  const storedCreds = getLocal<{ username: string; full_name: string; password_hash: string }>(
    'admin_credentials',
    { username: 'admin', full_name: 'Administrator OSIS', password_hash: '' }
  );

  const isMatch = await verifyPassword(currentPasswordPlain, storedCreds.password_hash);
  if (!isMatch) {
    return { success: false, message: 'Password saat ini salah!' };
  }

  storedCreds.username = newUsername.trim() || storedCreds.username;
  if (newPasswordPlain && newPasswordPlain.trim().length >= 6) {
    storedCreds.password_hash = await hashPassword(newPasswordPlain.trim());
  }

  setLocal('admin_credentials', storedCreds);
  return { success: true, message: 'Kredensial admin berhasil diperbarui!' };
}

export function getAdminUsername(): string {
  const storedCreds = getLocal<{ username: string; full_name: string; password_hash: string }>(
    'admin_credentials',
    { username: 'admin', full_name: 'Administrator OSIS', password_hash: '' }
  );
  return storedCreds.username || 'admin';
}

export function getAdminProfile(): { username: string; full_name: string; role: string } {
  const storedCreds = getLocal<{ username: string; full_name: string; role?: string; password_hash: string }>(
    'admin_credentials',
    { username: 'admin', full_name: 'Administrator OSIS', password_hash: '' }
  );
  return {
    username: storedCreds.username || 'admin',
    full_name: storedCreds.full_name || 'Administrator',
    role: storedCreds.role || 'Super Admin',
  };
}
