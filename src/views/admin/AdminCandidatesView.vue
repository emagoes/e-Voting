<template>
  <div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Calon Kandidat Ketua & Wakil Ketua OSIS</h4>
        <p class="text-muted small mb-0">Kelola nomor urut, foto pasangan calon, nama ketua dan wakil, visi, misi, dan slogan.</p>
      </div>
      <button @click="openModal()" class="btn btn-primary btn-sm d-inline-flex align-items-center gap-2">
        <i class="bi bi-person-plus-fill"></i>
        <span>Tambah Paslon Baru</span>
      </button>
    </div>

    <!-- Candidate Cards Grid -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Memuat data kandidat...</p>
    </div>

    <div v-else-if="candidates.length === 0" class="card card-eosis border-0 text-center py-5">
      <i class="bi bi-person-x fs-1 text-muted"></i>
      <h5 class="mt-3">Belum Ada Kandidat yang Didaftarkan</h5>
      <p class="text-muted small">Klik tombol "Tambah Paslon Baru" untuk memasukkan kandidat nomor 1.</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="cand in candidates" :key="cand.id" class="col-12 col-md-6 col-xl-4">
        <div class="card card-eosis border shadow-sm h-100 position-relative d-flex flex-column overflow-hidden">
          <!-- Order Number Badge -->
          <div class="candidate-badge-number">
            {{ cand.order_number }}
          </div>

          <!-- Photo with ratio -->
          <div class="ratio ratio-16x9 bg-light border-bottom overflow-hidden position-relative">
            <img
              :src="cand.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'"
              :alt="'Paslon No ' + cand.order_number"
              class="object-fit-cover w-100 h-100"
            />
          </div>

          <div class="card-body p-3 d-flex flex-column flex-grow-1">
            <div class="text-center mb-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">
                Nomor Urut {{ cand.order_number }}
              </span>
              <h5 class="fw-bold text-dark mb-0">{{ cand.chairperson_name }}</h5>
              <p class="text-secondary small fw-medium mb-1">& {{ cand.vice_chairperson_name }}</p>
            </div>

            <div class="bg-light p-2 rounded small text-muted text-center italic mb-3 border">
              "{{ cand.slogan || 'Membawa Perubahan Nyata' }}"
            </div>

            <div class="mb-2">
              <small class="fw-bold text-dark d-block">Visi:</small>
              <p class="small text-muted mb-2 text-truncate-2">{{ cand.vision }}</p>
            </div>

            <div class="mb-3">
              <small class="fw-bold text-dark d-block">Misi:</small>
              <div class="small text-muted text-truncate-2" style="white-space: pre-line;">{{ cand.mission }}</div>
            </div>

            <div class="mt-auto pt-3 border-top d-flex justify-content-end gap-2">
              <button @click="openModal(cand)" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button @click="handleDelete(cand)" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                <i class="bi bi-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Kandidat -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5);"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-3">
          <div class="modal-header border-bottom">
            <h5 class="modal-title fw-bold text-dark">
              {{ editingId ? 'Edit Data Paslon' : 'Tambah Paslon Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveCandidateData">
            <div class="modal-body p-4">
              <div v-if="modalError" class="alert alert-danger small py-2">
                {{ modalError }}
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-sm-4">
                  <label class="form-label small fw-bold text-secondary">Nomor Urut</label>
                  <input
                    v-model.number="formData.order_number"
                    type="number"
                    min="1"
                    class="form-control fw-bold"
                    required
                  />
                </div>
                <div class="col-12 col-sm-8">
                  <label class="form-label small fw-bold text-secondary">Slogan Singkat</label>
                  <input
                    v-model="formData.slogan"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: Bergerak Bersama, Menginspirasi Tanpa Batas"
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label small fw-bold text-secondary">Nama Calon Ketua</label>
                  <input
                    v-model="formData.chairperson_name"
                    type="text"
                    class="form-control"
                    placeholder="Nama lengkap calon ketua"
                    required
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label small fw-bold text-secondary">Nama Calon Wakil Ketua</label>
                  <input
                    v-model="formData.vice_chairperson_name"
                    type="text"
                    class="form-control"
                    placeholder="Nama lengkap calon wakil ketua"
                    required
                  />
                </div>
              </div>

              <!-- Foto Kandidat & Storage Upload -->
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Foto Pasangan Calon (Supabase Storage / URL)</label>
                <div class="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
                  <input
                    v-model="formData.photo_url"
                    type="text"
                    class="form-control"
                    placeholder="https://... atau unggah file foto di samping"
                  />
                  <label class="btn btn-outline-secondary d-flex align-items-center gap-1 text-nowrap mb-0 cursor-pointer">
                    <i class="bi bi-cloud-arrow-up"></i>
                    <span>{{ uploadingPhoto ? 'Mengunggah...' : 'Pilih Foto' }}</span>
                    <input
                      type="file"
                      accept="image/*"
                      class="d-none"
                      @change="handleFileUpload"
                      :disabled="uploadingPhoto"
                    />
                  </label>
                </div>
                <div class="form-text small">Foto tersimpan ke Supabase Storage bucket <code>eosis-media</code> (atau preview lokal).</div>
              </div>

              <!-- Photo Preview -->
              <div v-if="formData.photo_url" class="mb-3">
                <small class="text-muted d-block mb-1">Pratinjau Foto:</small>
                <img :src="formData.photo_url" alt="Pratinjau" class="rounded border object-fit-cover" style="max-height: 120px;" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Visi</label>
                <textarea
                  v-model="formData.vision"
                  rows="3"
                  class="form-control"
                  placeholder="Visi pasangan calon..."
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Misi (Tuliskan per baris nomor / poin)</label>
                <textarea
                  v-model="formData.mission"
                  rows="4"
                  class="form-control"
                  placeholder="1. Meningkatkan kegiatan...&#10;2. Menyelenggarakan program..."
                  required
                ></textarea>
              </div>
            </div>

            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="saving || uploadingPhoto">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ saving ? 'Menyimpan...' : 'Simpan Data Paslon' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCandidates, saveCandidate, deleteCandidate, uploadMedia } from '../../services/db';
import type { CandidateItem } from '../../types';

const candidates = ref<CandidateItem[]>([]);
const loading = ref(true);
const saving = ref(false);
const uploadingPhoto = ref(false);

const showModal = ref(false);
const editingId = ref<string | null>(null);
const modalError = ref('');
const formData = ref({
  order_number: 1,
  chairperson_name: '',
  vice_chairperson_name: '',
  photo_url: '',
  slogan: '',
  vision: '',
  mission: '',
});

async function loadData() {
  loading.value = true;
  try {
    candidates.value = await getCandidates();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

function openModal(cand?: CandidateItem) {
  modalError.value = '';
  if (cand) {
    editingId.value = cand.id;
    formData.value = {
      order_number: cand.order_number,
      chairperson_name: cand.chairperson_name,
      vice_chairperson_name: cand.vice_chairperson_name,
      photo_url: cand.photo_url,
      slogan: cand.slogan,
      vision: cand.vision,
      mission: cand.mission,
    };
  } else {
    editingId.value = null;
    const nextOrder = candidates.value.length > 0 ? Math.max(...candidates.value.map(c => c.order_number)) + 1 : 1;
    formData.value = {
      order_number: nextOrder,
      chairperson_name: '',
      vice_chairperson_name: '',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      slogan: '',
      vision: '',
      mission: '',
    };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  uploadingPhoto.value = true;
  try {
    const url = await uploadMedia(file, 'candidates');
    formData.value.photo_url = url;
  } catch (err: any) {
    alert('Gagal mengunggah foto: ' + (err?.message || 'Error'));
  } finally {
    uploadingPhoto.value = false;
  }
}

async function saveCandidateData() {
  if (
    !formData.value.chairperson_name.trim() ||
    !formData.value.vice_chairperson_name.trim() ||
    !formData.value.vision.trim() ||
    !formData.value.mission.trim()
  ) {
    modalError.value = 'Mohon lengkapi semua kolom yang wajib diisi.';
    return;
  }

  // Check unique order number
  const dupOrder = candidates.value.find(
    c => c.order_number === formData.value.order_number && c.id !== editingId.value
  );
  if (dupOrder) {
    modalError.value = `Nomor urut ${formData.value.order_number} sudah digunakan oleh paslon ${dupOrder.chairperson_name}.`;
    return;
  }

  saving.value = true;
  modalError.value = '';

  try {
    await saveCandidate(
      {
        order_number: formData.value.order_number,
        chairperson_name: formData.value.chairperson_name.trim(),
        vice_chairperson_name: formData.value.vice_chairperson_name.trim(),
        photo_url: formData.value.photo_url.trim(),
        slogan: formData.value.slogan.trim(),
        vision: formData.value.vision.trim(),
        mission: formData.value.mission.trim(),
      },
      editingId.value || undefined
    );
    await loadData();
    closeModal();
  } catch (err: any) {
    modalError.value = err?.message || 'Gagal menyimpan calon kandidat.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(cand: CandidateItem) {
  if (confirm(`Hapus data paslon No. ${cand.order_number} (${cand.chairperson_name} & ${cand.vice_chairperson_name})?`)) {
    try {
      await deleteCandidate(cand.id);
      await loadData();
    } catch (e) {
      alert('Gagal menghapus kandidat.');
    }
  }
}
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
