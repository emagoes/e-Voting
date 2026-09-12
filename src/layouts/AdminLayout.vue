<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- Desktop Sidebar -->
    <aside class="admin-sidebar d-none d-lg-flex p-3">
      <div class="d-flex align-items-center gap-2 mb-4 px-2">
        <div class="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-box-seam-fill fs-5"></i>
        </div>
        <div>
          <h6 class="mb-0 fw-bold text-white tracking-wide">eOSIS</h6>
          <small class="text-secondary" style="font-size: 0.75rem;">Panel Administrator</small>
        </div>
      </div>

      <nav class="nav flex-column flex-grow-1">
        <router-link to="/admin/dashboard" class="nav-link" active-class="active">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Beranda</span>
        </router-link>

        <router-link to="/admin/kelas" class="nav-link" active-class="active">
          <i class="bi bi-diagram-3-fill"></i>
          <span>Kelas</span>
        </router-link>

        <router-link to="/admin/siswa" class="nav-link" active-class="active">
          <i class="bi bi-people-fill"></i>
          <span>Siswa / User</span>
        </router-link>

        <router-link to="/admin/kandidat" class="nav-link" active-class="active">
          <i class="bi bi-person-badge-fill"></i>
          <span>Calon Kandidat</span>
        </router-link>

        <router-link to="/admin/perolehan-suara" class="nav-link" active-class="active">
          <i class="bi bi-bar-chart-fill"></i>
          <span>Perolehan Suara</span>
        </router-link>

        <router-link to="/admin/pengaturan" class="nav-link" active-class="active">
          <i class="bi bi-gear-fill"></i>
          <span>Pengaturan</span>
        </router-link>
      </nav>

      <div class="pt-3 border-top border-secondary border-opacity-25 mt-auto">
        <div class="px-2 py-2 mb-2 d-flex align-items-center gap-2 text-white-50">
          <i class="bi bi-shield-lock text-primary"></i>
          <span class="small text-truncate">{{ adminUsername }}</span>
        </div>
        <button @click="logout" class="btn btn-outline-danger w-full d-flex align-items-center justify-content-center gap-2 py-2 w-100">
          <i class="bi bi-box-arrow-right"></i>
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Header & Offcanvas Sidebar -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100 overflow-x-hidden">
      <header class="bg-white border-bottom px-3 py-2 px-md-4 d-flex align-items-center justify-content-between shadow-sm sticky-top">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-outline-secondary d-lg-none p-2 lh-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminOffcanvas">
            <i class="bi bi-list fs-5"></i>
          </button>
          <div>
            <span class="fw-bold text-dark d-block text-truncate" style="max-width: 280px;">{{ settings.school_name }}</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle small py-0">Periode {{ settings.election_period }}</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <router-link to="/login" target="_blank" class="btn btn-sm btn-outline-primary d-none d-sm-inline-flex align-items-center gap-1">
            <i class="bi bi-box-arrow-up-right"></i>
            <span>Portal Siswa</span>
          </router-link>
          <button @click="logout" class="btn btn-sm btn-light border text-danger d-flex align-items-center gap-1">
            <i class="bi bi-power"></i>
            <span class="d-none d-md-inline">Keluar</span>
          </button>
        </div>
      </header>

      <!-- Offcanvas for Mobile -->
      <div class="offcanvas offcanvas-start bg-dark text-white" tabindex="-1" id="adminOffcanvas">
        <div class="offcanvas-header border-bottom border-secondary">
          <h5 class="offcanvas-title fw-bold text-white d-flex align-items-center gap-2">
            <i class="bi bi-box-seam-fill text-primary"></i> eOSIS Menu
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-3 d-flex flex-column">
          <nav class="nav flex-column gap-1 flex-grow-1">
            <router-link to="/admin/dashboard" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-grid-1x2-fill me-2"></i> Beranda
            </router-link>
            <router-link to="/admin/kelas" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-diagram-3-fill me-2"></i> Kelas
            </router-link>
            <router-link to="/admin/siswa" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-people-fill me-2"></i> Siswa / User
            </router-link>
            <router-link to="/admin/kandidat" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-person-badge-fill me-2"></i> Calon Kandidat
            </router-link>
            <router-link to="/admin/perolehan-suara" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-bar-chart-fill me-2"></i> Perolehan Suara
            </router-link>
            <router-link to="/admin/pengaturan" class="nav-link text-white-50 p-2 rounded" active-class="bg-primary text-white" data-bs-dismiss="offcanvas">
              <i class="bi bi-gear-fill me-2"></i> Pengaturan
            </router-link>
          </nav>
          <div class="mt-auto pt-3 border-top border-secondary">
            <button @click="logout" class="btn btn-danger w-100" data-bs-dismiss="offcanvas">
              <i class="bi bi-box-arrow-right me-1"></i> Keluar
            </button>
          </div>
        </div>
      </div>

      <!-- Main Page Content Outlet -->
      <main class="flex-grow-1 p-3 p-md-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { clearAdminSession } from '../services/auth';
import { getSettings, getAdminUsername } from '../services/db';
import type { AppSettings } from '../types';

const router = useRouter();
const adminUsername = ref(getAdminUsername());
const settings = ref<AppSettings>({
  id: 1,
  school_name: 'eOSIS School',
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

function logout() {
  if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
    clearAdminSession();
    router.push('/admin/login');
  }
}
</script>
