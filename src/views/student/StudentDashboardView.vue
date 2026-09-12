<template>
  <div class="min-vh-100 bg-light d-flex flex-column">
    <!-- Student Header -->
    <header class="bg-white border-bottom shadow-sm py-3 px-3 px-md-4">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <img
            v-if="settings.school_logo"
            :src="settings.school_logo"
            alt="Logo"
            class="rounded-circle object-fit-cover border"
            style="width: 44px; height: 44px;"
          />
          <div v-else class="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-box-seam-fill"></i>
          </div>
          <div>
            <h5 class="fw-bold mb-0 text-dark">{{ settings.school_name }}</h5>
            <small class="text-muted">Pemilihan OSIS Periode {{ settings.election_period }}</small>
          </div>
        </div>

        <button @click="handleLogout" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
          <i class="bi bi-box-arrow-right"></i>
          <span class="d-none d-sm-inline">Keluar</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-4 py-md-5 flex-grow-1">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Welcome Alert -->
          <div class="card card-eosis border-0 shadow-sm p-4 mb-4">
            <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom">
              <div>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">Portal Pemilih</span>
                <h4 class="fw-bold text-dark mb-0">Selamat Datang, {{ student?.name }}</h4>
              </div>
              <div>
                <!-- Status Badge -->
                <span v-if="student?.has_voted" class="badge bg-success-subtle text-success border border-success px-3 py-2 fs-6 d-inline-flex align-items-center gap-1">
                  <i class="bi bi-check-circle-fill"></i> Hak Suara Telah Digunakan
                </span>
                <span v-else class="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-2 fs-6 d-inline-flex align-items-center gap-1">
                  <i class="bi bi-exclamation-circle-fill"></i> Belum Memilih
                </span>
              </div>
            </div>

            <!-- Biodata Section -->
            <div class="mt-4">
              <h6 class="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-person-lines-fill text-primary"></i> Biodata Siswa Pemilih
              </h6>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1">Nomor Induk Siswa Nasional (NISN)</small>
                    <span class="fw-bold text-dark fs-6">{{ student?.nisn }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1">Nama Lengkap</small>
                    <span class="fw-bold text-dark fs-6">{{ student?.name }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1">Kelas</small>
                    <span class="fw-bold text-dark fs-6">{{ student?.class_name || '-' }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="p-3 bg-light rounded-3 border">
                    <small class="text-muted d-block mb-1">Tanggal Lahir Terdaftar</small>
                    <span class="fw-bold text-dark fs-6">{{ formatDate(student?.birth_date) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Voting Action Section -->
            <div class="mt-4 pt-3 border-top">
              <!-- If Already Voted -->
              <div v-if="student?.has_voted" class="alert alert-success d-flex align-items-start gap-3 p-3 mb-0 rounded-3">
                <i class="bi bi-patch-check-fill fs-2 text-success flex-shrink-0"></i>
                <div>
                  <h6 class="fw-bold mb-1">Anda sudah menggunakan hak suara</h6>
                  <p class="mb-0 text-secondary small">
                    Terima kasih telah berpartisipasi menyukseskan pemilihan OSIS ini. Suara Anda telah tercatat dengan aman dan rahasia ke dalam sistem eOSIS.
                  </p>
                </div>
              </div>

              <!-- If Not Voted -->
              <div v-else>
                <div v-if="!settings.is_active" class="alert alert-warning mb-0">
                  <i class="bi bi-pause-circle me-1"></i>
                  Periode pemilihan sedang ditutup sementara oleh panitia. Silakan hubungi panitia OSIS.
                </div>

                <div v-else class="text-center py-3">
                  <p class="text-muted mb-3">
                    Hak suara Anda aktif dan belum digunakan. Silakan pelajari profil kandidat dan tentukan pilihan Anda secara langsung, umum, bebas, dan rahasia.
                  </p>
                  <router-link to="/siswa/vote" class="btn btn-primary btn-lg px-5 py-3 shadow-sm fw-bold d-inline-flex align-items-center gap-2">
                    <i class="bi bi-check2-square fs-5"></i>
                    <span>Berikan Suara Sekarang</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Box Luber Jurdil -->
          <div class="card border-0 bg-white p-3 shadow-sm rounded-3">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-shield-check fs-4"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1 text-dark">Jaminan Keamanan & Kerahasiaan Suara</h6>
                <p class="small text-muted mb-0">
                  Sistem eOSIS menggunakan teknologi enkripsi dan database constraint. Pilihan Anda sepenuhnya rahasia dan tidak dapat diketahui oleh pihak manapun, termasuk panitia dan administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getActiveStudent, clearStudentSession } from '../../services/auth';
import { getSettings } from '../../services/db';
import type { AppSettings, StudentItem } from '../../types';

const router = useRouter();
const student = ref<StudentItem | null>(getActiveStudent.value);

const settings = ref<AppSettings>({
  id: 1,
  school_name: 'eOSIS',
  school_logo: '',
  election_period: '2025/2026',
  is_active: true,
  welcome_message: '',
});

onMounted(async () => {
  try {
    settings.value = await getSettings();
  } catch (e) {
    console.error(e);
  }
});

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function handleLogout() {
  clearStudentSession();
  router.push('/login');
}
</script>
