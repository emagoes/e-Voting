<template>
  <div class="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
    <div class="w-100" style="max-width: 420px;">
      <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center bg-dark text-white p-2 rounded-circle shadow-sm mb-3" style="width: 72px; height: 72px;">
          <i class="bi bi-shield-lock-fill fs-2 text-primary"></i>
        </div>
        <h4 class="fw-bold text-dark mb-1">Panel Administrator eOSIS</h4>
        <p class="text-muted small">Kelola data kelas, siswa, kandidat, dan perolehan suara.</p>
      </div>

      <div class="card card-eosis shadow-sm border-0 p-4 mb-3">
        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <div>{{ errorMessage }}</div>
        </div>

        <form @submit.prevent="handleAdminLogin">
          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary">Username</label>
            <div class="input-group">
              <span class="input-group-text bg-light text-muted border-end-0">
                <i class="bi bi-person"></i>
              </span>
              <input
                v-model="username"
                type="text"
                class="form-control border-start-0"
                placeholder="Username admin"
                required
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold text-secondary">Password</label>
            <div class="input-group">
              <span class="input-group-text bg-light text-muted border-end-0">
                <i class="bi bi-key"></i>
              </span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control border-start-0 border-end-0"
                placeholder="Password"
                required
              />
              <button
                type="button"
                class="input-group-text bg-light border-start-0 text-muted"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-box-arrow-in-right"></i>
            <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk Panel Admin' }}</span>
          </button>
        </form>

        <div class="mt-4 pt-3 border-top text-center">
          <small class="text-muted d-block">Default Akun Admin: <strong class="text-dark">admin</strong> / Password: <strong class="text-dark">admin123</strong></small>
        </div>
      </div>

      <div class="text-center">
        <router-link to="/login" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <i class="bi bi-arrow-left"></i>
          <span>Kembali ke Halaman Login Siswa</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminLogin } from '../services/db';
import { setAdminSession } from '../services/auth';

const router = useRouter();
const username = ref('admin');
const password = ref('admin123');
const showPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

async function handleAdminLogin() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res = await adminLogin(username.value, password.value);
    if (!res.success) {
      errorMessage.value = res.message || 'Username atau password tidak valid.';
      isLoading.value = false;
      return;
    }

    setAdminSession(username.value);
    router.push('/admin/dashboard');
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal masuk.';
  } finally {
    isLoading.value = false;
  }
}
</script>
