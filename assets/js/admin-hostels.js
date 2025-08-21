import { guardAdmin, getCurrentUser, formatCurrency } from './auth.js';

const HOSTELS_KEY = 'u_stay_external_hostels';

function loadHostels() {
  try { return JSON.parse(localStorage.getItem(HOSTELS_KEY) || '[]'); } catch { return []; }
}
function saveHostels(list) { localStorage.setItem(HOSTELS_KEY, JSON.stringify(list)); }
function getMyHostels(email) { return loadHostels().filter(h => h.ownerEmail === email); }
function upsertHostel(record) {
  const list = loadHostels();
  const idx = list.findIndex(h => h.id === record.id);
  if (idx >= 0) list[idx] = record; else list.push(record);
  saveHostels(list);
}
function deleteHostel(id) {
  const list = loadHostels().filter(h => h.id !== id);
  saveHostels(list);
}

function createImageField(value = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-row';
  wrapper.innerHTML = `
    <div style="grid-column: span 2; display:flex; gap:8px;">
      <input type="url" placeholder="https://example.com/image.jpg" value="${value}" required style="flex:1;">
      <button type="button" class="button secondary remove-image-btn">Remove</button>
    </div>
  `;
  return wrapper;
}

function collectImages(imagesContainer) {
  const inputs = Array.from(imagesContainer.querySelectorAll('input[type="url"]'));
  return inputs.map(i => i.value.trim()).filter(Boolean);
}

function renderHostels(listEl, emptyEl, hostels) {
  listEl.innerHTML = '';
  if (!hostels.length) { emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');

  for (const h of hostels) {
    const card = document.createElement('div');
    card.className = 'booking-item';
    const imgs = (h.images || []).slice(0, 3).map(src => `<img src="${src}" alt="${h.name}" style="height:60px; width:90px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">`).join(' ');
    card.innerHTML = `
      <div class="booking-header">
        <strong>${h.name}</strong>
        <div style="display:flex; gap:8px;">
          <button class="button secondary" data-action="edit" data-id="${h.id}">Edit</button>
          <button class="button danger" data-action="delete" data-id="${h.id}">Delete</button>
        </div>
      </div>
      <div class="help">${h.location} • ${h.distanceKm} km from campus</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">${imgs}</div>
    `;
    listEl.appendChild(card);
  }
}

function init() {
  guardAdmin();
  const user = getCurrentUser();
  const form = document.getElementById('hostel-form');
  const idEl = document.getElementById('hostelId');
  const nameEl = document.getElementById('hostelName');
  const distanceEl = document.getElementById('distanceKm');
  const locationEl = document.getElementById('location');
  const imagesContainer = document.getElementById('imagesContainer');
  const addImageBtn = document.getElementById('addImageFieldBtn');
  const resetBtn = document.getElementById('resetFormBtn');
  const listEl = document.getElementById('hostelsList');
  const emptyEl = document.getElementById('noHostels');
  const formTitle = document.getElementById('form-title');

  // Seed with 3 image fields
  for (let i = 0; i < 3; i++) imagesContainer.appendChild(createImageField());

  addImageBtn.addEventListener('click', () => {
    imagesContainer.appendChild(createImageField());
  });

  imagesContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.classList.contains('remove-image-btn')) {
      const item = target.closest('.field-row');
      if (item) imagesContainer.removeChild(item);
    }
  });

  function resetForm() {
    idEl.value = '';
    nameEl.value = '';
    distanceEl.value = '';
    locationEl.value = '';
    imagesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) imagesContainer.appendChild(createImageField());
    formTitle.textContent = 'Add hostel';
    document.getElementById('saveHostelBtn').textContent = 'Save hostel';
  }

  resetBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const distanceKm = Number(distanceEl.value);
    const location = locationEl.value.trim();
    const images = collectImages(imagesContainer);

    if (!name || !Number.isFinite(distanceKm) || distanceKm < 0 || !location) {
      alert('Please complete name, valid distance, and location.');
      return;
    }
    if (images.length < 3) {
      alert('Please provide at least 3 image URLs.');
      return;
    }

    const now = new Date().toISOString();
    const record = {
      id: idEl.value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      name, distanceKm, location, images,
      ownerEmail: user.email,
      updatedAt: now,
      createdAt: idEl.value ? undefined : now,
    };

    // Preserve original createdAt if editing
    if (idEl.value) {
      const existing = loadHostels().find(h => h.id === idEl.value);
      if (existing) record.createdAt = existing.createdAt;
    }

    upsertHostel(record);
    resetForm();
    refreshList();
  });

  function refreshList() {
    const mine = getMyHostels(user.email);
    renderHostels(listEl, emptyEl, mine);
  }

  listEl.addEventListener('click', (e) => {
    const target = e.target;
    if (!target || !target.getAttribute) return;
    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    if (!action || !id) return;
    const record = loadHostels().find(h => h.id === id);
    if (!record || record.ownerEmail !== user.email) return;
    if (action === 'delete') {
      if (confirm('Delete this hostel?')) {
        deleteHostel(id);
        refreshList();
      }
    } else if (action === 'edit') {
      idEl.value = record.id;
      nameEl.value = record.name;
      distanceEl.value = String(record.distanceKm);
      locationEl.value = record.location;
      imagesContainer.innerHTML = '';
      for (const src of record.images) imagesContainer.appendChild(createImageField(src));
      formTitle.textContent = 'Edit hostel';
      document.getElementById('saveHostelBtn').textContent = 'Update hostel';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  refreshList();
}

document.addEventListener('DOMContentLoaded', init);

