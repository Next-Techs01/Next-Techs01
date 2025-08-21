import { registerStudent } from './auth.js';

function show(el) { el.classList.remove('hidden'); el.setAttribute('aria-hidden', 'false'); }
function hide(el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); }

function initSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const needsCheckbox = document.getElementById('hasAccessibilityNeeds');
  const needsType = document.getElementById('accessibilityType');
  needsCheckbox.addEventListener('change', () => {
    if (needsCheckbox.checked) {
      show(needsType);
      needsType.required = true;
    } else {
      hide(needsType);
      needsType.required = false;
      needsType.value = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const password = String(fd.get('password') || '');
    const confirm = String(fd.get('confirmPassword') || '');
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }

    const accepts = fd.get('acceptTerms');
    if (!accepts) {
      alert('You must accept the terms and conditions.');
      return;
    }

    const hasNeeds = Boolean(fd.get('hasAccessibilityNeeds'));
    const accessibilityType = String(fd.get('accessibilityType') || '').trim();
    if (hasNeeds && !accessibilityType) {
      alert('Please specify the type of disability.');
      return;
    }

    const profile = {
      name: String(fd.get('name')).trim(),
      programme: String(fd.get('programme')).trim(),
      gender: String(fd.get('gender')),
      affiliateHall: String(fd.get('affiliateHall')),
      admissionNumber: String(fd.get('admissionNumber')).trim(),
      yearOfStudy: String(fd.get('yearOfStudy')),
      email: String(fd.get('email')).trim(),
      password, // For demo only; do not store plain text in real apps
      hasAccessibilityNeeds: hasNeeds,
      accessibilityType: hasNeeds ? accessibilityType : '',
    };

    registerStudent(profile);
    location.href = '/index.html';
  });
}

document.addEventListener('DOMContentLoaded', initSignup);

