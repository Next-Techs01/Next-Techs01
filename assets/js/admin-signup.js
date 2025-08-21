import { registerAdmin } from './auth.js';

function isValidPhone(phone) {
  const cleaned = String(phone).trim();
  return cleaned.length >= 7; // basic length check for demo
}

function initAdminSignup() {
  const form = document.getElementById('admin-signup-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const gender = String(fd.get('gender') || '');
    const telephone = String(fd.get('telephone') || '').trim();

    if (!name || !email || !gender || !telephone) {
      alert('Please complete all fields.');
      return;
    }
    if (!isValidPhone(telephone)) {
      alert('Please enter a valid telephone number.');
      return;
    }

    const profile = { name, email, gender, telephone };
    registerAdmin(profile);
    location.href = '/admin.html';
  });
}

document.addEventListener('DOMContentLoaded', initAdminSignup);

