<template>
  <div class="min-vh-100 bg-light d-flex flex-column">
    <!-- Header -->
    <header class="bg-white border-bottom shadow-sm py-3 px-3 px-md-4 sticky-top">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <router-link to="/siswa/dashboard" class="btn btn-sm btn-outline-secondary me-2">
            <i class="bi bi-arrow-left"></i>
          </router-link>
          <div>
            <h5 class="fw-bold mb-0 text-dark">Surat Suara Elektronik</h5>
            <small class="text-muted">Pilih satu pasangan calon ketua dan wakil ketua OSIS</small>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light text-dark border d-none d-sm-inline-block">
            <i class="bi bi-person-circle me-1 text-primary"></i>{{ student?.name }}
          </span>
          <button @click="cancelVote" class="btn btn-sm btn-outline-danger">
            Batal
          </button>
        </div>
      </div>
    </header>

    <!-- Main Voting Area -->
    <main class="container py-4 flex-grow-1">
      <!-- Success Fullscreen/Modal Toast Overlay during 4s countdown -->
      <div v-if="voteSuccess" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-3" style="z-index: 9999;">
        <div class="card card-eosis border-0 shadow-lg text-center p-4 p-md-5" style="max-width: 500px;">
          <div class="mb-3">
            <div class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow" style="width: 80px; height: 80px;">
              <i class="bi bi-check-lg fs-1"></i>
            </div>
          </div>
          <h4 class="fw-bold text-success mb-2">Suara Anda Berhasil Dicatat!</h4>
          <p class="text-dark fs-5 mb-3 fw-semibold">
            "Suara Anda berhasil dicatat, terima kasih telah berpartisipasi"
          </p>
          <div class="bg-light p-3 rounded-3 border mb-3">
            <small class="text-muted d-block mb-1">Kembali otomatis ke halaman login dalam:</small>
            <span class="badge bg-primary fs-4 px-3 py-1">{{ countdownSeconds }} Detik</span>
          </div>
          <div class="progress" style="height: 6px;">
            <div
              class="progress-bar bg-success progress-bar-striped progress-bar-animated"
              :style="{ width: ((4 - countdownSeconds) / 4) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Error Alert if any -->
      <div v-if="voteError" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-octagon-fill fs-5"></i>
        <div>{{ voteError }}</div>
        <button type="button" class="btn-close" @click="voteError = ''"></button>
      </div>

      <!-- Candidate Cards Grid -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Memuat daftar calon kandidat...</p>
      </div>

      <div v-else-if="candidates.length === 0" class="text-center py-5">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <h5 class="mt-3">Belum ada kandidat yang terdaftar.</h5>
      </div>

      <div v-else class="row g-4 justify-content-center">
        <div
          v-for="candidate in candidates"
          :key="candidate.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card h-100 card-eosis candidate-card border shadow-sm position-relative d-flex flex-column">
            <!-- Order Number Badge -->
            <div class="candidate-badge-number">
              {{ candidate.order_number }}
            </div>

            <!-- Candidate Photo -->
            <div class="ratio ratio-4x3 bg-light border-bottom overflow-hidden">
              <img
                :src="candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'"
                :alt="'Paslon No ' + candidate.order_number"
                class="object-fit-cover w-100 h-100 transition-all"
                loading="lazy"
              />
            </div>

            <!-- Body Information -->
            <div class="card-body p-4 d-flex flex-column flex-grow-1">
              <div class="text-center mb-3">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">
                  Pasangan Calon #{{ candidate.order_number }}
                </span>
                <h5 class="fw-bold text-dark mb-1">
                  {{ candidate.chairperson_name }}
                </h5>
                <p class="text-secondary small mb-0 fw-medium">
                  & {{ candidate.vice_chairperson_name }}
                </p>
              </div>

              <!-- Slogan -->
              <div class="bg-light p-2 rounded text-center small text-muted italic mb-3 border">
                <i class="bi bi-quote me-1"></i>{{ candidate.slogan || 'Membawa Perubahan Positif' }}
              </div>

              <!-- Vision Accordion / Collapsible detail -->
              <div class="mb-3">
                <h6 class="small fw-bold text-dark text-uppercase tracking-wider mb-1">
                  <i class="bi bi-eye text-primary me-1"></i> Visi:
                </h6>
                <p class="small text-muted mb-0" style="white-space: pre-line;">
                  {{ candidate.vision }}
                </p>
              </div>

              <div class="mb-4">
                <h6 class="small fw-bold text-dark text-uppercase tracking-wider mb-1">
                  <i class="bi bi-list-check text-success me-1"></i> Misi:
                </h6>
                <div class="small text-muted" style="white-space: pre-line; max-height: 140px; overflow-y: auto;">
                  {{ candidate.mission }}
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-auto pt-3 border-top">
                <button
                  @click="openConfirmation(candidate)"
                  class="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  :disabled="isSubmitting || voteSuccess"
                >
                  <i class="bi bi-check2-circle fs-5"></i>
                  <span>Pilih Paslon No. {{ candidate.order_number }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Confirmation Modal -->
    <div
      v-if="selectedCandidate"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.6);"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-warning"></i>
              Konfirmasi Pilihan Suara
            </h5>
            <button type="button" class="btn-close" @click="selectedCandidate = null" :disabled="isSubmitting"></button>
          </div>

          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle fs-2 fw-bold mb-3 shadow" style="width: 64px; height: 64px;">
              {{ selectedCandidate.order_number }}
            </div>

            <h5 class="fw-bold mb-1">
              Pasangan Calon No. {{ selectedCandidate.order_number }}
            </h5>
            <p class="text-primary fw-semibold fs-5 mb-1">
              {{ selectedCandidate.chairperson_name }} & {{ selectedCandidate.vice_chairperson_name }}
            </p>
            <p class="small text-muted mb-3 italic">
              "{{ selectedCandidate.slogan }}"
            </p>

            <div class="alert alert-warning text-start small mb-0 d-flex gap-2">
              <i class="bi bi-info-circle-fill flex-shrink-0 fs-5"></i>
              <div>
                <strong>PENTING:</strong> Pastikan pilihan Anda sudah benar. Setiap siswa hanya dapat memilih <strong>1 kali</strong> dan pilihan yang telah disimpan tidak dapat diubah ataupun dibatalkan.
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-top d-flex justify-content-between p-3">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="selectedCandidate = null"
              :disabled="isSubmitting"
            >
              Batal & Tinjau Kembali
            </button>
            <button
              type="button"
              class="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
              @click="submitVote"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-check-lg"></i>
              <span>{{ isSubmitting ? 'Menyimpan Suara...' : 'Ya, Berikan Suara Ini' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getActiveStudent, clearStudentSession, updateCurrentStudentVoted } from '../../services/auth';
import { getCandidates, castVote } from '../../services/db';
import type { CandidateItem, StudentItem } from '../../types';

const router = useRouter();
const student = ref<StudentItem | null>(getActiveStudent.value);
const candidates = ref<CandidateItem[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);

const selectedCandidate = ref<CandidateItem | null>(null);
const voteSuccess = ref(false);
const voteError = ref('');
const countdownSeconds = ref(4);
let timerInterval: any = null;

onMounted(async () => {
  if (!student.value) {
    router.push('/login');
    return;
  }

  // If already voted, redirect back
  if (student.value.has_voted) {
    router.push('/siswa/dashboard');
    return;
  }

  try {
    candidates.value = await getCandidates();
  } catch (err: any) {
    voteError.value = 'Gagal memuat kandidat.';
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function cancelVote() {
  router.push('/siswa/dashboard');
}

function openConfirmation(cand: CandidateItem) {
  selectedCandidate.value = cand;
  voteError.value = '';
}

async function submitVote() {
  if (!student.value || !selectedCandidate.value) return;

  isSubmitting.value = true;
  voteError.value = '';

  try {
    const res = await castVote(student.value.id, selectedCandidate.value.id);

    if (!res.success) {
      voteError.value = res.message || 'Gagal menyimpan suara.';
      selectedCandidate.value = null;
      isSubmitting.value = false;
      return;
    }

    // Success!
    selectedCandidate.value = null;
    isSubmitting.value = false;
    voteSuccess.value = true;

    // Update in-memory session status
    updateCurrentStudentVoted();

    // 4-Second Countdown to automatic logout as strictly requested
    countdownSeconds.value = 4;
    timerInterval = setInterval(() => {
      countdownSeconds.value -= 1;
      if (countdownSeconds.value <= 0) {
        clearInterval(timerInterval);
        // Clear session and return to student login page
        clearStudentSession();
        router.push('/login');
      }
    }, 1000);
  } catch (err: any) {
    voteError.value = err?.message || 'Terjadi kesalahan sistem saat mencatat suara.';
    isSubmitting.value = false;
    selectedCandidate.value = null;
  }
}
</script>
