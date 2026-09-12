<template>
  <div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Daftar Siswa Pemilih (DPT)</h4>
        <p class="text-muted small mb-0">Kelola data pemilih tetap: NISN, Nama, Tanggal Lahir, Kelas, dan Status Hak Suara.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button @click="openModal()" class="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
          <i class="bi bi-person-plus-fill"></i>
          <span>Tambah Siswa</span>
        </button>
        <button @click="seedDemoStudents" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" title="Generate data siswa sampel">
          <i class="bi bi-magic"></i>
          <span class="d-none d-sm-inline">Isi Sampel Cepat</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="card card-eosis border-0 p-3 mb-3">
      <div class="row g-2 align-items-center">
        <!-- Search Input -->
        <div class="col-12 col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control border-start-0"
              placeholder="Cari NISN atau Nama Siswa..."
            />
          </div>
        </div>

        <!-- Filter Kelas -->
        <div class="col-6 col-md-3">
          <select v-model="filterClass" class="form-select">
            <option value="">Semua Kelas</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Filter Status Memilih -->
        <div class="col-6 col-md-2">
          <select v-model="filterStatus" class="form-select">
            <option value="">Semua Status</option>
            <option value="voted">Sudah Memilih</option>
            <option value="unvoted">Belum Memilih</option>
          </select>
        </div>

        <!-- Counter Badge -->
        <div class="col-12 col-md-2 text-md-end">
          <span class="badge bg-light text-dark border p-2 w-100 text-center">
            Total: {{ filteredStudents.length }} Siswa
          </span>
        </div>
      </div>
    </div>

    <!-- Table of Students -->
    <div class="card card-eosis border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3" style="width: 50px;">No</th>
              <th scope="col">NISN</th>
              <th scope="col">Nama Siswa</th>
              <th scope="col">Kelas</th>
              <th scope="col">Tanggal Lahir</th>
              <th scope="col">Status Hak Suara</th>
              <th scope="col" class="text-end pe-3" style="width: 130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Memuat data pemilih...
              </td>
            </tr>
            <tr v-else-if="filteredStudents.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                Tidak ada data siswa pemilih yang cocok dengan filter atau pencarian.
              </td>
            </tr>
            <tr v-for="(student, idx) in filteredStudents" :key="student.id">
              <td class="ps-3 text-muted small">{{ idx + 1 }}</td>
              <td>
                <span class="font-monospace fw-bold text-dark">{{ student.nisn }}</span>
              </td>
              <td>
                <div class="fw-semibold text-dark">{{ student.name }}</div>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ student.class_name || '-' }}</span>
              </td>
              <td class="small text-secondary">
                {{ formatDate(student.birth_date) }}
              </td>
              <td>
                <span v-if="student.has_voted" class="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1">
                  <i class="bi bi-check2-circle"></i> Sudah Memilih
                </span>
                <span v-else class="badge bg-warning-subtle text-warning-emphasis border border-warning d-inline-flex align-items-center gap-1">
                  <i class="bi bi-clock"></i> Belum Memilih
                </span>
              </td>
              <td class="text-end pe-3">
                <div class="btn-group btn-group-sm">
                  <button
                    v-if="student.has_voted"
                    @click="handleResetVote(student)"
                    class="btn btn-outline-warning"
                    title="Reset Status Suara"
                  >
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button @click="openModal(student)" class="btn btn-outline-primary" title="Edit Siswa">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="handleDelete(student)" class="btn btn-outline-danger" title="Hapus Siswa">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Siswa -->
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
              {{ editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveStudentData">
            <div class="modal-body p-4">
              <div v-if="modalError" class="alert alert-danger small py-2">
                {{ modalError }}
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">NISN (10 Digit Angka Unik)</label>
                <input
                  v-model="formData.nisn"
                  type="text"
                  class="form-control font-monospace"
                  placeholder="Contoh: 0061234509"
                  required
                  maxlength="20"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Nama Lengkap Siswa</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Nama sesuai absen atau kartu pelajar"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Tanggal Lahir</label>
                <input
                  v-model="formData.birth_date"
                  type="date"
                  class="form-control"
                  required
                />
                <div class="form-text small">Digunakan sebagai autentikasi login pemilih siswa bersama NISN.</div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Kelas</label>
                <select v-model="formData.class_id" class="form-select" required>
                  <option value="" disabled>Pilih Kelas Siswa</option>
                  <option v-for="c in classes" :key="c.id" :value="c.id">
                    {{ c.name }} (Kelas {{ c.grade }})
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ saving ? 'Menyimpan...' : 'Simpan Data Siswa' }}</span>
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
import { getStudents, getClasses, saveStudent, deleteStudent, resetStudentVote } from '../../services/db';
import type { StudentItem, ClassItem } from '../../types';

const students = ref<StudentItem[]>([]);
const classes = ref<ClassItem[]>([]);
const loading = ref(true);
const saving = ref(false);

const searchQuery = ref('');
const filterClass = ref('');
const filterStatus = ref('');

const showModal = ref(false);
const editingId = ref<string | null>(null);
const modalError = ref('');
const formData = ref({
  nisn: '',
  name: '',
  birth_date: '',
  class_id: '',
});

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q);
    const matchClass = !filterClass.value || s.class_id === filterClass.value;
    const matchStatus =
      !filterStatus.value ||
      (filterStatus.value === 'voted' && s.has_voted) ||
      (filterStatus.value === 'unvoted' && !s.has_voted);
    return matchSearch && matchClass && matchStatus;
  });
});

async function loadData() {
  loading.value = true;
  try {
    const [stuList, clsList] = await Promise.all([getStudents(), getClasses()]);
    classes.value = clsList;
    students.value = stuList;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function openModal(stu?: StudentItem) {
  modalError.value = '';
  if (stu) {
    editingId.value = stu.id;
    formData.value = {
      nisn: stu.nisn,
      name: stu.name,
      birth_date: stu.birth_date,
      class_id: stu.class_id,
    };
  } else {
    editingId.value = null;
    formData.value = {
      nisn: '',
      name: '',
      birth_date: '2008-01-01',
      class_id: classes.value[0]?.id || '',
    };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

async function saveStudentData() {
  if (!formData.value.nisn.trim() || !formData.value.name.trim() || !formData.value.class_id) {
    modalError.value = 'Mohon lengkapi semua kolom.';
    return;
  }

  // Check unique NISN
  const dup = students.value.find(s => s.nisn === formData.value.nisn.trim() && s.id !== editingId.value);
  if (dup) {
    modalError.value = `NISN ${formData.value.nisn} sudah terdaftar atas nama ${dup.name}.`;
    return;
  }

  saving.value = true;
  modalError.value = '';

  try {
    await saveStudent(
      {
        nisn: formData.value.nisn.trim(),
        name: formData.value.name.trim(),
        birth_date: formData.value.birth_date,
        class_id: formData.value.class_id,
      },
      editingId.value || undefined
    );
    await loadData();
    closeModal();
  } catch (err: any) {
    modalError.value = err?.message || 'Gagal menyimpan data siswa.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(stu: StudentItem) {
  if (confirm(`Yakin ingin menghapus data siswa "${stu.name}" (${stu.nisn})?`)) {
    try {
      await deleteStudent(stu.id);
      await loadData();
    } catch (e) {
      alert('Gagal menghapus siswa.');
    }
  }
}

async function handleResetVote(stu: StudentItem) {
  if (confirm(`Reset status suara untuk "${stu.name}"? Siswa ini akan dapat memilih kembali.`)) {
    try {
      await resetStudentVote(stu.id);
      await loadData();
    } catch (e) {
      alert('Gagal mereset status suara.');
    }
  }
}

async function seedDemoStudents() {
  if (classes.value.length === 0) {
    alert('Buat kelas terlebih dahulu.');
    return;
  }
  const randomNames = [
    { name: 'Kurnia Ramadhan', birth: '2008-03-12' },
    { name: 'Larasati Dewi', birth: '2008-07-24' },
    { name: 'Muhammad Ilham', birth: '2008-10-05' },
    { name: 'Nadia Salsabila', birth: '2007-04-16' },
    { name: 'Oscar Maulana', birth: '2007-12-01' },
  ];

  for (const item of randomNames) {
    const randomNisn = '008' + Math.floor(1000000 + Math.random() * 9000000);
    const randomClass = classes.value[Math.floor(Math.random() * classes.value.length)];
    await saveStudent({
      nisn: randomNisn,
      name: item.name,
      birth_date: item.birth,
      class_id: randomClass.id,
    });
  }
  await loadData();
  alert('5 data siswa sampel baru berhasil ditambahkan!');
}
</script>
