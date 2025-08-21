(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

export function formatCurrency(value) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  } catch (e) {
    return `$${value.toFixed(2)}`;
  }
}

export function persistBooking(booking) {
  const key = 'u_stay_bookings';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ id: crypto.randomUUID(), ...booking });
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getBookings() {
  const key = 'u_stay_bookings';
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function removeBooking(id) {
  const key = 'u_stay_bookings';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = existing.filter(b => b.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
}

