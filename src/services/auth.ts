import { ref, computed } from 'vue';
import type { StudentItem } from '../types';

function getInitialStudent(): StudentItem | null {
  const data = sessionStorage.getItem('eosis_student_session');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

const currentAdmin = ref<string | null>(sessionStorage.getItem('eosis_admin_session'));
const currentStudent = ref<StudentItem | null>(getInitialStudent());

export const isAdminAuthenticated = computed(() => Boolean(currentAdmin.value));
export const isStudentAuthenticated = computed(() => Boolean(currentStudent.value));
export const getActiveStudent = computed(() => currentStudent.value);

export function setAdminSession(username: string) {
  sessionStorage.setItem('eosis_admin_session', username);
  currentAdmin.value = username;
}

export function clearAdminSession() {
  sessionStorage.removeItem('eosis_admin_session');
  currentAdmin.value = null;
}

export function setStudentSession(student: StudentItem) {
  sessionStorage.setItem('eosis_student_session', JSON.stringify(student));
  currentStudent.value = student;
}

export function updateCurrentStudentVoted() {
  if (currentStudent.value) {
    currentStudent.value.has_voted = true;
    currentStudent.value.voted_at = new Date().toISOString();
    sessionStorage.setItem('eosis_student_session', JSON.stringify(currentStudent.value));
  }
}

export function clearStudentSession() {
  sessionStorage.removeItem('eosis_student_session');
  currentStudent.value = null;
}
