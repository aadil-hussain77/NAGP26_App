const api = '/api/employees';

// Cache commonly used elements
const tbody = document.querySelector('#employees-table tbody');
const employeeModalEl = document.getElementById('employeeModal');
const employeeModal = new bootstrap.Modal(employeeModalEl);
const formEl = document.getElementById('form');
const titleEl = document.getElementById('employeeModalLabel');
const emptyPlaceholder = document.getElementById('empty-placeholder');
const employeesCard = document.getElementById('employees-card');

// form fields
const fields = {
  id: document.getElementById('EmployeeId'),
  code: document.getElementById('EmployeeCode'),
  firstName: document.getElementById('FirstName'),
  lastName: document.getElementById('LastName'),
  email: document.getElementById('Email'),
  contactNo: document.getElementById('ContactNo'),
  department: document.getElementById('Department'),
  designation: document.getElementById('Designation'),
  isActive: document.getElementById('IsActive')
};

// API helpers
async function apiGet(path = '') {
  const res = await fetch(`${api}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPost(payload) {
  const res = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
}

async function apiPut(id, payload) {
  const res = await fetch(`${api}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`PUT ${id} failed: ${res.status}`);
  return res;
}

async function apiDelete(id) {
  const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${id} failed: ${res.status}`);
  return res;
}

// Rendering
function renderRow(e) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${e.employeeId}</td>
    <td>${escapeHtml(e.employeeCode)}</td>
    <td>${escapeHtml(e.firstName)} ${escapeHtml(e.lastName)}</td>
    <td>${escapeHtml(e.email)}</td>
    <td>${escapeHtml(e.contactNo)}</td>
    <td>${escapeHtml(e.department)}</td>
    <td>${escapeHtml(e.designation)}</td>
    <td>${e.isActive ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
    <td>
      <div class="btn-group" role="group">
        <button data-id="${e.employeeId}" class="btn btn-sm btn-outline-primary edit">Edit</button>
        <button data-id="${e.employeeId}" class="btn btn-sm btn-outline-danger delete">Delete</button>
      </div>
    </td>`;
  return tr;
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

async function fetchEmployees() {
  try {
    const data = await apiGet('');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
      // show empty placeholder
      emptyPlaceholder.classList.remove('d-none');
      employeesCard.classList.add('d-none');
      return;
    }

    // show table
    emptyPlaceholder.classList.add('d-none');
    employeesCard.classList.remove('d-none');

    data.forEach(e => tbody.appendChild(renderRow(e)));
  } catch (err) {
    console.error(err);
    alert('Failed to load employees. See console for details.');
  }
}

// Form handling (separation of concerns)
function setFormValues(emp) {
  fields.id.value = emp?.employeeId ?? '';
  fields.code.value = emp?.employeeCode ?? '';
  fields.firstName.value = emp?.firstName ?? '';
  fields.lastName.value = emp?.lastName ?? '';
  fields.email.value = emp?.email ?? '';
  fields.contactNo.value = emp?.contactNo ?? '';
  fields.department.value = emp?.department ?? '';
  fields.designation.value = emp?.designation ?? '';
  fields.isActive.checked = emp ? !!emp.isActive : true;
}

function getFormPayload() {
  return {
    employeeCode: fields.code.value.trim(),
    firstName: fields.firstName.value.trim(),
    lastName: fields.lastName.value.trim(),
    email: fields.email.value.trim(),
    contactNo: fields.contactNo.value.trim(),
    department: fields.department.value.trim(),
    designation: fields.designation.value.trim(),
    isActive: fields.isActive.checked
  };
}

function openModalForCreate() {
  titleEl.textContent = 'New Employee';
  setFormValues(null);
  clearValidation();
  employeeModal.show();
}

function openModalForEdit(emp) {
  titleEl.textContent = 'Edit Employee';
  setFormValues(emp);
  clearValidation();
  employeeModal.show();
}

function clearValidation() {
  formEl.classList.remove('was-validated');
}

// Setup event listeners with delegation
document.addEventListener('click', async (ev) => {
  const t = ev.target;

  if (t.matches('#btn-refresh')) {
    await fetchEmployees();
    return;
  }

  if (t.matches('#btn-new') || t.matches('#btn-empty-new')) {
    openModalForCreate();
    return;
  }

  if (t.matches('.edit')) {
    const id = t.getAttribute('data-id');
    try {
      const emp = await apiGet(`/${id}`);
      openModalForEdit(emp);
    } catch (err) {
      console.error(err);
      alert('Failed to load employee.');
    }
    return;
  }

  if (t.matches('.delete')) {
    const id = t.getAttribute('data-id');
    if (!confirm('Delete this employee?')) return;
    try {
      await apiDelete(id);
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
    return;
  }
});

// Form submit - handles create and update
formEl.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  // Bootstrap validation
  formEl.classList.add('was-validated');
  if (!formEl.checkValidity()) return;

  const id = fields.id.value;
  const payload = getFormPayload();

  try {
    if (id) {
      await apiPut(id, payload);
    } else {
      await apiPost(payload);
    }
    employeeModal.hide();
    await fetchEmployees();
  } catch (err) {
    console.error(err);
    alert('Save failed. See console for details.');
  }
});

// small utility: fetch data on load
window.addEventListener('load', () => {
  fetchEmployees();
});
