import { getBookings, removeBooking, formatCurrency } from './app.js';

function render() {
  const list = document.getElementById('bookings-list');
  const empty = document.getElementById('empty-state');
  if (!list || !empty) return;

  const bookings = getBookings();
  list.innerHTML = '';

  if (!bookings.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  for (const booking of bookings) {
    const el = document.createElement('div');
    el.className = 'booking-item';
    el.innerHTML = `
      <div class="booking-header">
        <strong>${booking.hall}</strong>
        <button class="button danger" data-id="${booking.id}">Cancel</button>
      </div>
      <div class="help">${booking.roomType} • ${booking.semester} • ${booking.name} (${booking.email})</div>
      <div class="total"><span>Total</span><strong>${formatCurrency(booking.total)}</strong></div>
    `;
    list.appendChild(el);
  }

  list.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.matches('button[data-id]')) {
      const id = target.getAttribute('data-id');
      removeBooking(id);
      render();
    }
  });
}

document.addEventListener('DOMContentLoaded', render);

