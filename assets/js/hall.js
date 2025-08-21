import { persistBooking, formatCurrency } from './app.js';

function parsePrice(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function computeTotal({ priceSingle, priceDouble, roomType, semester }) {
  const base = roomType === 'Single' ? priceSingle : priceDouble;
  if (semester === 'Full Year') {
    return Math.round(base * 2 * 0.95);
  }
  return base;
}

function updateTotalDisplay(totalEl, total) {
  if (totalEl) {
    totalEl.textContent = formatCurrency(total);
  }
}

function initHallBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const dataset = form.dataset;
  const hallName = dataset.hall || 'U-STAY Hall';
  const priceSingle = parsePrice(dataset.priceSingle);
  const priceDouble = parsePrice(dataset.priceDouble);

  const roomTypeEl = document.getElementById('roomType');
  const semesterEl = document.getElementById('semester');
  const totalEl = document.getElementById('total-amount');

  function recalc() {
    const roomType = roomTypeEl.value;
    const semester = semesterEl.value;
    const total = computeTotal({ priceSingle, priceDouble, roomType, semester });
    updateTotalDisplay(totalEl, total);
  }

  roomTypeEl.addEventListener('change', recalc);
  semesterEl.addEventListener('change', recalc);
  recalc();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const roomType = String(formData.get('roomType'));
    const semester = String(formData.get('semester'));
    const total = computeTotal({ priceSingle, priceDouble, roomType, semester });

    if (!name || !email) {
      alert('Please provide your name and email.');
      return;
    }

    persistBooking({ hall: hallName, roomType, semester, name, email, total });
    window.location.href = '/bookings.html';
  });
}

document.addEventListener('DOMContentLoaded', initHallBooking);

