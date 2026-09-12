<template>
  <div class="container-fluid p-0">
    <!-- Header & Action -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Perolehan Suara Pemilihan OSIS</h4>
        <p class="text-muted small mb-0">Hasil rekapitulasi real-time perolehan suara calon ketua dan wakil ketua OSIS.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="form-check form-switch me-2">
          <input
            v-model="autoRefresh"
            class="form-check-input"
            type="checkbox"
            id="autoRefreshSwitch"
            @change="toggleAutoRefresh"
          />
          <label class="form-check-label small text-muted" for="autoRefreshSwitch">
            Auto-Sync (5s)
          </label>
        </div>
        <button @click="loadResults" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-anim': loading }"></i>
          <span>Perbarui Data</span>
        </button>
      </div>
    </div>

    <!-- Overview Bar & Integrity Banner -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card card-eosis border-0 p-3 h-100">
          <span class="text-muted small fw-semibold text-uppercase">Total Suara Masuk</span>
          <h2 class="fw-bold text-primary my-1">{{ totalVotes }}</h2>
          <small class="text-secondary">
            Dari {{ stats.totalStudents }} pemilih terdaftar ({{ stats.participationRate }}%)
          </small>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <div class="card card-eosis border-0 p-3 h-100 bg-white d-flex justify-content-center">
          <div class="d-flex align-items-start gap-3">
            <div class="p-2 bg-success-subtle text-success rounded-circle flex-shrink-0">
              <i class="bi bi-shield-check fs-4"></i>
            </div>
            <div>
              <h6 class="fw-bold mb-1 text-dark">Asas LUBER: Rekapitulasi Suara Terenkripsi & Anonim</h6>
              <p class="small text-muted mb-0">
                Sistem tidak menyimpan relasi antara identitas siswa dengan pilihan kandidat. Penghitungan suara di bawah ini merupakan akumulasi matematis murni yang diverifikasi oleh database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-3 mb-4">
      <!-- Bar Chart -->
      <div class="col-12 col-lg-7">
        <div class="card card-eosis border-0 p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-bar-chart-line text-primary"></i> Grafik Batang Perolehan Suara
            </h6>
            <span class="badge bg-light text-dark border">Chart.js</span>
          </div>
          <div class="position-relative" style="min-height: 280px;">
            <canvas ref="barChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Doughnut Chart -->
      <div class="col-12 col-lg-5">
        <div class="card card-eosis border-0 p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-pie-chart text-success"></i> Proporsi Persentase Suara
            </h6>
            <span class="badge bg-light text-dark border">Diagram Lingkaran</span>
          </div>
          <div class="position-relative d-flex justify-content-center align-items-center" style="min-height: 280px;">
            <canvas ref="doughnutChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Table Card -->
    <div class="card card-eosis border-0 p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0">Tabel Rincian Perolehan Suara</h5>
        <span class="badge bg-primary fs-6 px-3 py-1">Total Suara: {{ totalVotes }}</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3" style="width: 100px;">No Urut</th>
              <th scope="col" style="width: 80px;">Foto</th>
              <th scope="col">Pasangan Calon (Ketua & Wakil)</th>
              <th scope="col" style="width: 30%;">Visual Progres</th>
              <th scope="col" class="text-center" style="width: 130px;">Jumlah Suara</th>
              <th scope="col" class="text-end pe-3" style="width: 120px;">Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tallies.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                Belum ada data kandidat atau suara yang terdaftar.
              </td>
            </tr>
            <tr v-for="item in sortedTallies" :key="item.candidate_id">
              <td class="ps-3">
                <span class="badge bg-primary fs-6 px-3 py-2 rounded-circle">
                  {{ item.order_number }}
                </span>
              </td>
              <td>
                <img
                  :src="item.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60'"
                  :alt="item.chairperson_name"
                  class="rounded-3 border object-fit-cover"
                  style="width: 52px; height: 52px;"
                />
              </td>
              <td>
                <div class="fw-bold text-dark fs-6">{{ item.chairperson_name }}</div>
                <div class="text-secondary small">& {{ item.vice_chairperson_name }}</div>
              </td>
              <td>
                <div class="progress" style="height: 12px; border-radius: 6px;">
                  <div
                    class="progress-bar fw-bold"
                    :class="getProgressBarClass(item.order_number)"
                    role="progressbar"
                    :style="{ width: item.percentage + '%' }"
                  ></div>
                </div>
              </td>
              <td class="text-center">
                <span class="badge bg-light text-dark border fs-6 px-3 py-1">
                  {{ item.votes_count }} Suara
                </span>
              </td>
              <td class="text-end pe-3">
                <span class="fw-bold text-primary fs-5">{{ item.percentage }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { getVoteTallies, getStatistics } from '../../services/db';
import type { VoteTally, VotingStats } from '../../types';

Chart.register(...registerables);

const tallies = ref<VoteTally[]>([]);
const totalVotes = ref(0);
const stats = ref<VotingStats>({
  totalStudents: 0,
  totalClasses: 0,
  totalCandidates: 0,
  votedStudents: 0,
  unvotedStudents: 0,
  participationRate: 0,
});
const loading = ref(false);
const autoRefresh = ref(false);
let refreshTimer: any = null;

const barChartCanvas = ref<HTMLCanvasElement | null>(null);
const doughnutChartCanvas = ref<HTMLCanvasElement | null>(null);
let barChartInstance: Chart | null = null;
let doughnutChartInstance: Chart | null = null;

const sortedTallies = computed(() => {
  return [...tallies.value].sort((a, b) => a.order_number - b.order_number);
});

function getProgressBarClass(order: number) {
  const classes = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-danger'];
  return classes[(order - 1) % classes.length];
}

async function loadResults() {
  loading.value = true;
  try {
    const [res, statRes] = await Promise.all([getVoteTallies(), getStatistics()]);
    tallies.value = res.tallies;
    totalVotes.value = res.totalVotes;
    stats.value = statRes;

    await nextTick();
    renderCharts();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function renderCharts() {
  const labels = sortedTallies.value.map(t => `#${t.order_number} ${t.chairperson_name}`);
  const dataCounts = sortedTallies.value.map(t => t.votes_count);
  const colors = [
    'rgba(37, 99, 235, 0.85)',
    'rgba(16, 185, 129, 0.85)',
    'rgba(245, 158, 11, 0.85)',
    'rgba(14, 165, 233, 0.85)',
    'rgba(239, 68, 68, 0.85)',
  ];
  const borderColors = [
    'rgb(37, 99, 235)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(14, 165, 233)',
    'rgb(239, 68, 68)',
  ];

  // Bar Chart
  if (barChartCanvas.value) {
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(barChartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Jumlah Suara',
            data: dataCounts,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => ` ${context.parsed.y} Suara (${totalVotes.value > 0 ? ((context.parsed.y / totalVotes.value) * 100).toFixed(1) : 0}%)`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  // Doughnut Chart
  if (doughnutChartCanvas.value) {
    if (doughnutChartInstance) doughnutChartInstance.destroy();

    doughnutChartInstance = new Chart(doughnutChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: totalVotes.value === 0 ? [1] : dataCounts,
            backgroundColor: totalVotes.value === 0 ? ['#e2e8f0'] : colors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: context => {
                if (totalVotes.value === 0) return ' Belum ada suara masuk';
                const count = context.parsed;
                const pct = totalVotes.value > 0 ? ((count / totalVotes.value) * 100).toFixed(1) : 0;
                return ` ${count} Suara (${pct}%)`;
              },
            },
          },
        },
        cutout: '65%',
      },
    });
  }
}

function toggleAutoRefresh() {
  if (autoRefresh.value) {
    refreshTimer = setInterval(() => {
      loadResults();
    }, 5000);
  } else {
    if (refreshTimer) clearInterval(refreshTimer);
  }
}

onMounted(() => {
  loadResults();
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (barChartInstance) barChartInstance.destroy();
  if (doughnutChartInstance) doughnutChartInstance.destroy();
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
