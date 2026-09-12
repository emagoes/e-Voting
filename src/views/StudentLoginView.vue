<template>
  <div class="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
    <!-- Container -->
    <div class="w-100" style="max-width: 460px;">
      <!-- Header / Logo -->
      <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center bg-white p-2 rounded-circle shadow-sm mb-3 border" style="width: 84px; height: 84px;">
          <img :src="displayLogo" alt="Logo Sekolah" class="rounded-circle object-fit-cover w-100 h-100" />
        </div>
        <h4 class="fw-bold text-dark mb-1 tracking-tight">{{ settings.school_name || 'SMP Negeri 1 Sumobito' }}</h4>
        <div class="d-flex align-items-center justify-content-center gap-2">
          <span class="badge bg-primary text-white px-2.5 py-1">e-Voting</span>
          <span class="text-muted small fw-medium">Tahun Ajaran {{ settings.election_period }}</span>
        </div>
      </div>

      <!-- Card Login -->
      <div class="card card-eosis shadow-sm border-0 p-4 mb-3">
        <div class="text-center mb-3">
          <h5 class="fw-bold mb-1">Masuk Pemilih Siswa</h5>
          <p class="text-muted small mb-0">Silakan masukkan NISN dan Tanggal Lahir untuk memverifikasi hak suara Anda.</p>
        </div>

        <div v-if="!settings.is_active" class="alert alert-warning d-flex align-items-center gap-2 small py-2">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <div>Pemilihan sedang ditutup sementara oleh panitia.</div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 small py-2">
          <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
          <div>{{ errorMessage }}</div>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary">NISN (Nomor Induk Siswa Nasional)</label>
            <div class="input-group">
              <span class="input-group-text bg-light text-muted border-end-0">
                <i class="bi bi-person-vcard"></i>
              </span>
              <input
                v-model="nisn"
                type="text"
                class="form-control border-start-0"
                placeholder="Contoh: 0061234501"
                required
                autocomplete="off"
                maxlength="15"
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold text-secondary">Tanggal Lahir</label>
            <div class="input-group">
              <span class="input-group-text bg-light text-muted border-end-0">
                <i class="bi bi-calendar3"></i>
              </span>
              <input
                v-model="birthDate"
                type="date"
                class="form-control border-start-0"
                required
              />
            </div>
            <div class="form-text small text-muted">Gunakan format tanggal lahir yang terdaftar pada pihak sekolah.</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-box-arrow-in-right"></i>
            <span>{{ isLoading ? 'Memeriksa Data...' : 'Masuk dan Periksa Hak Suara' }}</span>
          </button>
        </form>

        <!-- Quick test account pills -->
        <div class="mt-4 pt-3 border-top">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-bold text-muted">Akun Contoh Pengujian Cepat:</span>
          </div>
          <div class="d-flex flex-wrap gap-1">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary py-1 px-2 small"
              @click="fillQuick('0061234501', '2008-05-15')"
              title="Siswa Belum Memilih"
            >
              <i class="bi bi-check2-circle text-warning me-1"></i>0061234501 (Belum Memilih)
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary py-1 px-2 small"
              @click="fillQuick('0061234503', '2008-01-10')"
              title="Siswa Sudah Memilih"
            >
              <i class="bi bi-check2-all text-success me-1"></i>0061234503 (Sudah Memilih)
            </button>
          </div>
        </div>
      </div>

      <!-- Footer / Admin Link -->
      <div class="text-center">
        <router-link to="/admin/login" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <i class="bi bi-shield-lock"></i>
          <span>Masuk sebagai Administrator / Panitia</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentLogin, getSettings } from '../services/db';
import { setStudentSession } from '../services/auth';
import type { AppSettings } from '../types';
import schoolLogoImage from '../assets/images/regenerated_image_1789224215518.png';

const router = useRouter();
const nisn = ref('');
const birthDate = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const settings = ref<AppSettings>({
  id: 1,
  school_name: 'SMP Negeri 1 Sumobito',
  school_logo: schoolLogoImage,
  election_period: '2026/2027',
  is_active: true,
  welcome_message: '',
});

const displayLogo = computed(() => {
  if (settings.value.school_logo && !settings.value.school_logo.includes('unsplash.com')) {
    return settings.value.school_logo;
  }
  return schoolLogoImage;
});

onMounted(async () => {
  try {
    settings.value = await getSettings();
  } catch (e) {
    console.error(e);
  }
});

function fillQuick(sampleNisn: string, sampleBirth: string) {
  nisn.value = sampleNisn;
  birthDate.value = sampleBirth;
  errorMessage.value = '';
}

async function handleLogin() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res = await studentLogin(nisn.value, birthDate.value);
    if (!res.success || !res.student) {
      errorMessage.value = res.message || 'NISN atau Tanggal Lahir tidak valid.';
      isLoading.value = false;
      return;
    }

    setStudentSession(res.student);
    router.push('/siswa/dashboard');
  } catch (err: any) {
    errorMessage.value = err?.message || 'Terjadi kesalahan sistem saat mencoba masuk.';
  } finally {
    isLoading.value = false;
  }
}
</script>
