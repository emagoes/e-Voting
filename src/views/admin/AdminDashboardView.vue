<template>
  <div class="container-fluid p-0">
    <!-- Title & Refresh -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Beranda & Statistik Pemilihan</h4>
        <p class="text-muted small mb-0">Ringkasan data siswa pemilih, kelas, kandidat, dan progres partisipasi hak suara.</p>
      </div>
      <button @click="loadStats" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ 'spin-anim': loading }"></i>
        <span>Segarkan Data</span>
      </button>
    </div>

    <!-- Stats Cards Grid -->
    <div class="row g-3 mb-4">
      <!-- Total Siswa -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Total Siswa Terdaftar</span>
              <h3 class="fw-bold text-dark my-1">{{ stats.totalStudents }}</h3>
              <small class="text-primary"><i class="bi bi-person-check me-1"></i>Daftar Pemilih Tetap (DPT)</small>
            </div>
            <div class="p-3 bg-primary-subtle text-primary rounded-3">
              <i class="bi bi-people-fill fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Kelas -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Total Kelas</span>
              <h3 class="fw-bold text-dark my-1">{{ stats.totalClasses }}</h3>
              <small class="text-secondary"><i class="bi bi-diagram-3 me-1"></i>Tingkat X, XI, dan XII</small>
            </div>
            <div class="p-3 bg-info-subtle text-info-emphasis rounded-3">
              <i class="bi bi-building fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Kandidat -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Total Paslon Kandidat</span>
              <h3 class="fw-bold text-dark my-1">{{ stats.totalCandidates }}</h3>
              <small class="text-success"><i class="bi bi-award me-1"></i>Calon Ketua & Wakil OSIS</small>
            </div>
            <div class="p-3 bg-success-subtle text-success rounded-3">
              <i class="bi bi-person-badge-fill fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Sudah Memilih -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Siswa Sudah Memilih</span>
              <h3 class="fw-bold text-success my-1">{{ stats.votedStudents }}</h3>
              <small class="text-success"><i class="bi bi-check2-all me-1"></i>Hak suara digunakan</small>
            </div>
            <div class="p-3 bg-success-subtle text-success rounded-3">
              <i class="bi bi-patch-check-fill fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Belum Memilih -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Siswa Belum Memilih</span>
              <h3 class="fw-bold text-warning-emphasis my-1">{{ stats.unvotedStudents }}</h3>
              <small class="text-warning-emphasis"><i class="bi bi-clock-history me-1"></i>Menunggu partisipasi</small>
            </div>
            <div class="p-3 bg-warning-subtle text-warning-emphasis rounded-3">
              <i class="bi bi-hourglass-split fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Persentase Partisipasi -->
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Tingkat Partisipasi</span>
              <h3 class="fw-bold text-primary my-1">{{ stats.participationRate }}%</h3>
              <small class="text-primary"><i class="bi bi-activity me-1"></i>Partisipasi Suara</small>
            </div>
            <div class="p-3 bg-primary-subtle text-primary rounded-3">
              <i class="bi bi-pie-chart-fill fs-3"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Participation Visual Card -->
    <div class="card card-eosis border-0 p-4 mb-4">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-0 text-dark">Progres Partisipasi Hak Suara</h5>
          <small class="text-muted">Dari total {{ stats.totalStudents }} siswa yang terdaftar dalam DPT</small>
        </div>
        <span class="badge bg-primary fs-6 px-3 py-2">{{ stats.votedStudents }} / {{ stats.totalStudents }} Siswa ({{ stats.participationRate }}%)</span>
      </div>

      <div class="progress" style="height: 18px; border-radius: 9px;">
        <div
          class="progress-bar bg-primary progress-bar-striped progress-bar-animated fw-bold"
          role="progressbar"
          :style="{ width: stats.participationRate + '%' }"
        >
          {{ stats.participationRate > 8 ? stats.participationRate + '%' : '' }}
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center text-muted small mt-2">
        <span>0%</span>
        <span>Target: 100% Partisipasi Siswa</span>
        <span>100%</span>
      </div>
    </div>

    <!-- Quick Actions & Secret Ballot Notice -->
    <div class="row g-3">
      <div class="col-12 col-md-7">
        <div class="card card-eosis border-0 p-4 h-100">
          <h5 class="fw-bold text-dark mb-3">Aksi Cepat Menu</h5>
          <div class="row g-2">
            <div class="col-6 col-sm-4">
              <router-link to="/admin/siswa" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-person-plus-fill fs-4 text-primary"></i>
                <span class="small fw-bold">Kelola Siswa</span>
              </router-link>
            </div>
            <div class="col-6 col-sm-4">
              <router-link to="/admin/kandidat" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-person-badge-fill fs-4 text-success"></i>
                <span class="small fw-bold">Calon Kandidat</span>
              </router-link>
            </div>
            <div class="col-6 col-sm-4">
              <router-link to="/admin/perolehan-suara" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-bar-chart-fill fs-4 text-warning-emphasis"></i>
                <span class="small fw-bold">Perolehan Suara</span>
              </router-link>
            </div>
            <div class="col-6 col-sm-4">
              <router-link to="/admin/kelas" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-diagram-3-fill fs-4 text-info"></i>
                <span class="small fw-bold">Daftar Kelas</span>
              </router-link>
            </div>
            <div class="col-6 col-sm-4">
              <router-link to="/admin/pengaturan" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-gear-fill fs-4 text-secondary"></i>
                <span class="small fw-bold">Pengaturan</span>
              </router-link>
            </div>
            <div class="col-6 col-sm-4">
              <router-link to="/login" target="_blank" class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-2 text-decoration-none">
                <i class="bi bi-box-arrow-up-right fs-4 text-dark"></i>
                <span class="small fw-bold">Buka Bilik Suara</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <div class="card card-eosis border-0 p-4 h-100 bg-white">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-shield-lock-fill text-success fs-4"></i>
            <h5 class="fw-bold mb-0 text-dark">Integritas Rahasia (Secret Ballot)</h5>
          </div>
          <p class="small text-secondary mb-3">
            Sesuai mandat LUBER JURDIL, eOSIS <strong>tidak menampilkan ataupun menyimpan</strong> hubungan antara identitas siswa dengan pasangan calon yang dipilih.
          </p>
          <ul class="list-unstyled small text-muted mb-0 d-flex flex-column gap-2">
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>Admin hanya melihat status siswa: <strong>Sudah</strong> atau <strong>Belum Memilih</strong>.</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>Pencegahan double-vote divalidasi langsung di level database Supabase (RPC atomic locking).</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>Tally perolehan suara dihitung secara agregat murni.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStatistics } from '../../services/db';
import type { VotingStats } from '../../types';

const stats = ref<VotingStats>({
  totalStudents: 0,
  totalClasses: 0,
  totalCandidates: 0,
  votedStudents: 0,
  unvotedStudents: 0,
  participationRate: 0,
});
const loading = ref(false);

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await getStatistics();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.spin-anim {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
