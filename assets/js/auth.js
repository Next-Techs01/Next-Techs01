const USER_KEY = 'u_stay_user';
const STUDENTS_KEY = 'u_stay_students';
const ADMINS_KEY = 'u_stay_admins';

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getCurrentUser());
}

export function login({ email, role, name }) {
  const cleanRole = role === 'Administrator' ? 'Administrator' : 'Student';
  const user = { email, role: cleanRole, name: name || email };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}

export function guardAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'Administrator') {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    location.replace(`/login.html?returnTo=${returnTo}`);
  }
}

function ensureNavAuthControls() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const existingAdmin = nav.querySelector('#nav-admin-link');
  const existingHostels = nav.querySelector('#nav-hostels-link');
  const existingLogin = nav.querySelector('#nav-login-link');
  const existingSignup = nav.querySelector('#nav-signup-link');
  const existingLogout = nav.querySelector('#nav-logout-btn');
  if (existingAdmin) existingAdmin.remove();
  if (existingHostels) existingHostels.remove();
  if (existingLogin) existingLogin.remove();
  if (existingSignup) existingSignup.remove();
  if (existingLogout) existingLogout.remove();

  const user = getCurrentUser();
  if (user && user.role === 'Administrator') {
    const adminLink = document.createElement('a');
    adminLink.id = 'nav-admin-link';
    adminLink.href = '/admin.html';
    adminLink.className = 'nav-link';
    adminLink.textContent = 'Admin';
    nav.appendChild(adminLink);

    const hostelsLink = document.createElement('a');
    hostelsLink.id = 'nav-hostels-link';
    hostelsLink.href = '/admin-hostels.html';
    hostelsLink.className = 'nav-link';
    hostelsLink.textContent = 'Manage Hostels';
    nav.appendChild(hostelsLink);
  }

  if (user) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'nav-logout-btn';
    logoutBtn.className = 'nav-link';
    logoutBtn.type = 'button';
    logoutBtn.textContent = `Logout`;
    logoutBtn.addEventListener('click', () => {
      logout();
      // After logout, return to home
      location.href = '/index.html';
    });
    nav.appendChild(logoutBtn);
  } else {
    const loginLink = document.createElement('a');
    loginLink.id = 'nav-login-link';
    loginLink.href = '/login.html';
    loginLink.className = 'nav-link';
    loginLink.textContent = 'Login';
    nav.appendChild(loginLink);

    const signupLink = document.createElement('a');
    signupLink.id = 'nav-signup-link';
    signupLink.href = '/signup.html';
    signupLink.className = 'nav-link';
    signupLink.textContent = 'Sign Up';
    nav.appendChild(signupLink);
  }
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const role = String(formData.get('role') || 'Student');
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    login({ email, role, name });
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');
    if (role === 'Administrator') {
      location.href = '/admin.html';
    } else if (returnTo) {
      location.href = returnTo;
    } else {
      location.href = '/index.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  ensureNavAuthControls();
  initLoginForm();
});

export function registerStudent(profile) {
  const list = JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
  const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  const stored = { id, ...profile };
  list.push(stored);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  // Auto-login student
  login({ email: profile.email, role: 'Student', name: profile.name });
  return stored;
}

export function registerAdmin(profile) {
  const list = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
  const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  const stored = { id, ...profile };
  list.push(stored);
  localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
  // Auto-login as Administrator
  login({ email: profile.email, role: 'Administrator', name: profile.name });
  return stored;
}

