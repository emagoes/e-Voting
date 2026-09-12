<template>
  <div class="container-fluid p-0">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Pengaturan Aplikasi & Sekolah</h4>
        <p class="text-muted small mb-0">Atur profil sekolah, logo, periode pemilihan, kredensial admin, dan integrasi Supabase.</p>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4">
      <i class="bi bi-check-circle-fill fs-5"></i>
      <div>{{ successMessage }}</div>
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <div>{{ errorMessage }}</div>
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="row g-4">
      <!-- Pengaturan Identitas Sekolah & Pemilihan -->
      <div class="col-12 col-lg-7">
        <div class="card card-eosis border-0 p-4 h-100">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-building-gear text-primary"></i> Identitas Sekolah & Periode Pemilihan
          </h5>

          <form @submit.prevent="saveSchoolSettings">
            <div class="mb-3">
              <label class="form-label small fw-bold text-secondary">Nama Sekolah</label>
              <input
                v-model="settings.school_name"
                type="text"
                class="form-control"
                placeholder="Contoh: SMA Negeri 1 Harapan Bangsa"
                required
              />
              <div class="form-text small">Nama ini akan otomatis ditampilkan pada seluruh header dan halaman login siswa.</div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-12 col-sm-6">
                <label class="form-label small fw-bold text-secondary">Periode Pemilihan</label>
                <input
                  v-model="settings.election_period"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: 2025/2026"
                  required
                />
              </div>

              <div class="col-12 col-sm-6">
                <label class="form-label small fw-bold text-secondary">Status Pemilihan</label>
                <select v-model="settings.is_active" class="form-select">
                  <option :value="true">Dibuka (Siswa Dapat Memilih)</option>
                  <option :value="false">Ditutup Sementara (Bilik Suara Nonaktif)</option>
                </select>
              </div>
            </div>

            <!-- Logo Sekolah Upload -->
            <div class="mb-3">
              <label class="form-label small fw-bold text-secondary">Logo Sekolah (Supabase Storage / URL)</label>
              <div class="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
                <input
                  v-model="settings.school_logo"
                  type="text"
                  class="form-control"
                  placeholder="https://... atau pilih gambar logo"
                />
                <label class="btn btn-outline-secondary d-flex align-items-center gap-1 text-nowrap mb-0 cursor-pointer">
                  <i class="bi bi-cloud-arrow-up"></i>
                  <span>{{ uploadingLogo ? 'Mengunggah...' : 'Unggah Logo' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="handleLogoUpload"
                    :disabled="uploadingLogo"
                  />
                </label>
              </div>
              <div class="form-text small">Disimpan ke Supabase Storage bucket <code>eosis-media</code> atau data-URL.</div>
            </div>

            <!-- Logo Preview -->
            <div v-if="settings.school_logo" class="mb-3 d-flex align-items-center gap-3 p-2 border rounded bg-light">
              <img :src="settings.school_logo" alt="Logo Preview" class="rounded-circle border object-fit-cover" style="width: 50px; height: 50px;" />
              <div>
                <span class="small fw-bold d-block text-dark">Pratinjau Logo Sekolah</span>
                <small class="text-muted">Ditampilkan di header aplikasi dan kartu pemilih</small>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold text-secondary">Pesan Pembuka / Petunjuk Siswa</label>
              <textarea
                v-model="settings.welcome_message"
                rows="3"
                class="form-control"
                placeholder="Pesan yang tampil pada halaman siswa..."
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary d-inline-flex align-items-center gap-2" :disabled="savingSettings || uploadingLogo">
              <span v-if="savingSettings" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-check2-circle"></i>
              <span>{{ savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Sekolah' }}</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Ganti Kredensial Admin -->
      <div class="col-12 col-lg-5">
        <div class="card card-eosis border-0 p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-key-fill text-warning"></i> Keamanan Akun Admin
          </h5>

          <form @submit.prevent="handleUpdateAdmin">
            <div class="mb-3">
              <label class="form-label small fw-bold text-secondary">Username Admin Saat Ini</label>
              <input
                v-model="adminForm.newUsername"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold text-secondary">Password Saat Ini (Wajib)</label>
              <input
                v-model="adminForm.currentPassword"
                type="password"
                class="form-control"
                placeholder="Masukkan password admin lama"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold text-secondary">Password Baru (Opsional)</label>
              <input
                v-model="adminForm.newPassword"
                type="password"
                class="form-control"
                placeholder="Kosongkan jika tidak ingin mengubah password"
                minlength="6"
              />
              <div class="form-text small">Password dienkripsi dengan standar hash SHA-256 (tidak pernah disimpan plain text).</div>
            </div>

            <button type="submit" class="btn btn-dark w-100 d-inline-flex align-items-center justify-content-center gap-2" :disabled="savingAdmin">
              <span v-if="savingAdmin" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-shield-check"></i>
              <span>{{ savingAdmin ? 'Memperbarui...' : 'Perbarui Kredensial Admin' }}</span>
            </button>
          </form>
        </div>

        <!-- Supabase Connection & SQL Script -->
        <div class="card card-eosis border-0 p-4">
          <h5 class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-database-fill-gear text-info"></i> Konfigurasi Supabase
          </h5>
          <p class="small text-muted mb-3">
            Hubungkan project Supabase Anda untuk sinkronisasi cloud real-time.
          </p>

          <form @submit.prevent="handleSaveSupabase">
            <div class="mb-2">
              <label class="form-label small fw-bold text-secondary">Supabase Project URL</label>
              <input
                v-model="supabaseConfig.url"
                type="text"
                class="form-control form-control-sm font-monospace"
                placeholder="https://xyzcompany.supabase.co"
              />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold text-secondary">Supabase Anon Key (Public Key)</label>
              <input
                v-model="supabaseConfig.anonKey"
                type="password"
                class="form-control form-control-sm font-monospace"
                placeholder="eyJhbGciOi..."
              />
              <div class="form-text small text-danger">Hanya gunakan Anon Public Key. Jangan pernah memasukkan Service Role Key!</div>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-outline-primary btn-sm flex-grow-1">
                <i class="bi bi-save me-1"></i> Simpan Koneksi
              </button>
              <button type="button" @click="copySqlScript" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-filetype-sql me-1"></i> Salin Skrip SQL
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
import { getSettings, updateSettings, updateAdminCredentials, uploadMedia, getAdminUsername } from '../../services/db';
import { getSupabaseConfig, saveSupabaseConfig } from '../../services/supabase';
import type { AppSettings } from '../../types';

const settings = ref<AppSettings>({
  id: 1,
  school_name: '',
  school_logo: '',
  election_period: '2026/2027',
  is_active: true,
  welcome_message: '',
});

const adminForm = ref({
  newUsername: getAdminUsername(),
  currentPassword: '',
  newPassword: '',
});

const supabaseConfig = ref({
  url: '',
  anonKey: '',
});

const successMessage = ref('');
const errorMessage = ref('');
const savingSettings = ref(false);
const savingAdmin = ref(false);
const uploadingLogo = ref(false);

onMounted(async () => {
  try {
    settings.value = await getSettings();
    const sc = getSupabaseConfig();
    supabaseConfig.value = {
      url: sc.url,
      anonKey: sc.anonKey,
    };
  } catch (e) {
    console.error(e);
  }
});

async function handleLogoUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  uploadingLogo.value = true;
  try {
    const url = await uploadMedia(file, 'logo');
    settings.value.school_logo = url;
    successMessage.value = 'Logo sekolah berhasil diunggah!';
  } catch (err: any) {
    errorMessage.value = 'Gagal mengunggah logo: ' + (err?.message || 'Error');
  } finally {
    uploadingLogo.value = false;
  }
}

async function saveSchoolSettings() {
  savingSettings.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await updateSettings({
      school_name: settings.value.school_name.trim(),
      school_logo: settings.value.school_logo.trim(),
      election_period: settings.value.election_period.trim(),
      is_active: settings.value.is_active,
      welcome_message: settings.value.welcome_message.trim(),
    });
    successMessage.value = 'Pengaturan sekolah dan periode pemilihan berhasil disimpan!';
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal menyimpan pengaturan sekolah.';
  } finally {
    savingSettings.value = false;
  }
}

async function handleUpdateAdmin() {
  if (!adminForm.value.currentPassword) {
    errorMessage.value = 'Password saat ini wajib diisi untuk verifikasi.';
    return;
  }

  savingAdmin.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const res = await updateAdminCredentials(
      adminForm.value.currentPassword,
      adminForm.value.newUsername,
      adminForm.value.newPassword || undefined
    );

    if (!res.success) {
      errorMessage.value = res.message || 'Gagal memperbarui kredensial.';
      savingAdmin.value = false;
      return;
    }

    successMessage.value = 'Kredensial admin (username & password) berhasil diperbarui!';
    adminForm.value.currentPassword = '';
    adminForm.value.newPassword = '';
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal memperbarui admin.';
  } finally {
    savingAdmin.value = false;
  }
}

function handleSaveSupabase() {
  try {
    saveSupabaseConfig(supabaseConfig.value.url, supabaseConfig.value.anonKey);
    successMessage.value = 'Kredensial Supabase berhasil disimpan! Sistem akan otomatis menggunakan koneksi ini.';
  } catch (e) {
    errorMessage.value = 'Gagal menyimpan konfigurasi Supabase.';
  }
}

async function copySqlScript() {
  try {
    const res = await fetch('/supabase_schema.sql');
    let sqlText = '';
    if (res.ok) {
      sqlText = await res.text();
    } else {
      sqlText = `-- Skrip database eOSIS tersedia di root repository file supabase_schema.sql`;
    }
    await navigator.clipboard.writeText(sqlText);
    alert('Skrip SQL Supabase lengkap telah disalin ke clipboard! Silakan paste ke Supabase SQL Editor.');
  } catch (e) {
    alert('Buka file supabase_schema.sql pada project untuk melihat seluruh skrip DDL, RLS, dan RPC function.');
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
