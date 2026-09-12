<template>
  <div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Manajemen Kelas</h4>
        <p class="text-muted small mb-0">Kelola data kelas dan tingkatan untuk pengelompokan siswa pemilih.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
        <i class="bi bi-plus-lg"></i>
        <span>Tambah Kelas Baru</span>
      </button>
    </div>

    <!-- Filter & Search Card -->
    <div class="card card-eosis border-0 p-3 mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control border-start-0"
              placeholder="Cari nama kelas (misal: Kelas 7A, Kelas 7, Kelas 8, Kelas 9)..."
            />
          </div>
        </div>
        <div class="col-12 col-md-4">
          <select v-model="filterGrade" class="form-select">
            <option value="">Semua Tingkatan (7, 8, 9)</option>
            <option value="7">Tingkat Kelas 7</option>
            <option value="8">Tingkat Kelas 8</option>
            <option value="9">Tingkat Kelas 9</option>
          </select>
        </div>
        <div class="col-12 col-md-2 text-md-end">
          <span class="badge bg-light text-dark border px-2 py-2 w-100 text-center">
            Total: {{ filteredClasses.length }} Kelas
          </span>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card card-eosis border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3" style="width: 60px;">No</th>
              <th scope="col">Nama Kelas</th>
              <th scope="col">Tingkat</th>
              <th scope="col">Jumlah Siswa</th>
              <th scope="col" class="text-end pe-3" style="width: 140px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Memuat data kelas...
              </td>
            </tr>
            <tr v-else-if="filteredClasses.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">
                Tidak ada data kelas yang cocok dengan pencarian.
              </td>
            </tr>
            <tr v-for="(cls, idx) in filteredClasses" :key="cls.id">
              <td class="ps-3 text-muted small">{{ idx + 1 }}</td>
              <td>
                <span class="fw-bold text-dark">{{ cls.name }}</span>
              </td>
              <td>
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                  Kelas {{ cls.grade }}
                </span>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                  <i class="bi bi-people me-1"></i>{{ studentCounts[cls.id] || 0 }} Siswa
                </span>
              </td>
              <td class="text-end pe-3">
                <div class="btn-group btn-group-sm">
                  <button @click="openModal(cls)" class="btn btn-outline-primary" title="Edit Kelas">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="handleDelete(cls)" class="btn btn-outline-danger" title="Hapus Kelas">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Kelas -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5);"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-3">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark">
              {{ editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveClassData">
            <div class="modal-body p-4">
              <div v-if="modalError" class="alert alert-danger small py-2">
                {{ modalError }}
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Tingkat Kelas</label>
                <select v-model="formData.grade" class="form-select" required>
                  <option value="7">Kelas 7 (Tujuh)</option>
                  <option value="8">Kelas 8 (Delapan)</option>
                  <option value="9">Kelas 9 (Sembilan)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Nama Kelas Lengkap</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: 7A, 7B, 8C, 9D"
                  required
                />
              </div>
            </div>
            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ saving ? 'Menyimpan...' : 'Simpan Data Kelas' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getClasses, saveClass, deleteClass, getStudents } from '../../services/db';
import type { ClassItem } from '../../types';

const classes = ref<ClassItem[]>([]);
const studentCounts = ref<Record<string, number>>({});
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const filterGrade = ref('');

const showModal = ref(false);
const editingId = ref<string | null>(null);
const modalError = ref('');
const formData = ref({
  name: '',
  grade: 'X',
});

const filteredClasses = computed(() => {
  return classes.value.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchGrade = !filterGrade.value || c.grade === filterGrade.value;
    return matchSearch && matchGrade;
  });
});

async function loadData() {
  loading.value = true;
  try {
    const [clsList, stuList] = await Promise.all([getClasses(), getStudents()]);
    classes.value = clsList;

    const counts: Record<string, number> = {};
    stuList.forEach(s => {
      if (s.class_id) {
        counts[s.class_id] = (counts[s.class_id] || 0) + 1;
      }
    });
    studentCounts.value = counts;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function openModal(cls?: ClassItem) {
  modalError.value = '';
  if (cls) {
    editingId.value = cls.id;
    formData.value = {
      name: cls.name,
      grade: cls.grade,
    };
  } else {
    editingId.value = null;
    formData.value = {
      name: '',
      grade: '7',
    };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

async function saveClassData() {
  if (!formData.value.name.trim()) {
    modalError.value = 'Nama kelas wajib diisi.';
    return;
  }
  saving.value = true;
  modalError.value = '';

  try {
    await saveClass(
      {
        name: formData.value.name.trim(),
        grade: formData.value.grade,
      },
      editingId.value || undefined
    );
    await loadData();
    closeModal();
  } catch (err: any) {
    modalError.value = err?.message || 'Gagal menyimpan kelas.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(cls: ClassItem) {
  const count = studentCounts.value[cls.id] || 0;
  let confirmMsg = `Yakin ingin menghapus kelas "${cls.name}"?`;
  if (count > 0) {
    confirmMsg += ` Terdapat ${count} siswa di kelas ini!`;
  }
  if (confirm(confirmMsg)) {
    try {
      await deleteClass(cls.id);
      await loadData();
    } catch (e) {
      alert('Gagal menghapus kelas.');
    }
  }
}
</script>
