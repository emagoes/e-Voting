import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { isAdminAuthenticated, isStudentAuthenticated } from '../services/auth';

import StudentLoginView from '../views/StudentLoginView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';
import StudentDashboardView from '../views/student/StudentDashboardView.vue';
import StudentVoteView from '../views/student/StudentVoteView.vue';

import AdminLayout from '../layouts/AdminLayout.vue';
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminClassesView from '../views/admin/AdminClassesView.vue';
import AdminStudentsView from '../views/admin/AdminStudentsView.vue';
import AdminCandidatesView from '../views/admin/AdminCandidatesView.vue';
import AdminResultsView from '../views/admin/AdminResultsView.vue';
import AdminSettingsView from '../views/admin/AdminSettingsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'StudentLogin',
    component: StudentLoginView,
    meta: { guestOnlyStudent: true },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView,
    meta: { guestOnlyAdmin: true },
  },
  // Student routes
  {
    path: '/siswa/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboardView,
    meta: { requiresStudent: true },
  },
  {
    path: '/siswa/vote',
    name: 'StudentVote',
    component: StudentVoteView,
    meta: { requiresStudent: true },
  },
  // Admin routes wrapped in AdminLayout
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardView,
      },
      {
        path: 'kelas',
        name: 'AdminClasses',
        component: AdminClassesView,
      },
      {
        path: 'siswa',
        name: 'AdminStudents',
        component: AdminStudentsView,
      },
      {
        path: 'kandidat',
        name: 'AdminCandidates',
        component: AdminCandidatesView,
      },
      {
        path: 'perolehan-suara',
        name: 'AdminResults',
        component: AdminResultsView,
      },
      {
        path: 'pengaturan',
        name: 'AdminSettings',
        component: AdminSettingsView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Navigation Route Guards
router.beforeEach((to, _from, next) => {
  const adminLoggedIn = isAdminAuthenticated.value;
  const studentLoggedIn = isStudentAuthenticated.value;

  if (to.meta.requiresAdmin && !adminLoggedIn) {
    return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresStudent && !studentLoggedIn) {
    return next({ name: 'StudentLogin' });
  }

  if (to.meta.guestOnlyAdmin && adminLoggedIn) {
    return next({ name: 'AdminDashboard' });
  }

  if (to.meta.guestOnlyStudent && studentLoggedIn) {
    return next({ name: 'StudentDashboard' });
  }

  next();
});

export default router;
