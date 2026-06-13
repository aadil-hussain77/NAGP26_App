const api = '/api/employees';

async function fetchEmployees() {
    const res = await fetch(api);
    const data = await res.json();
    const tbody = document.querySelector('#employees-table tbody');
    tbody.innerHTML = '';
    data.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.employeeId}</td>
            <td>${e.employeeCode}</td>
            <td>${e.firstName} ${e.lastName}</td>
            <td>${e.email}</td>
            <td>${e.contactNo}</td>
            <td>${e.department}</td>
            <td>${e.designation}</td>
            <td>${e.isActive}</td>
            <td>
                <button data-id="${e.employeeId}" class="edit">Edit</button>
                <button data-id="${e.employeeId}" class="delete">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function showForm(emp) {
    document.getElementById('employee-form').style.display = 'block';
    document.getElementById('form-title').textContent = emp ? 'Edit Employee' : 'New Employee';
    document.getElementById('EmployeeId').value = emp?.employeeId ?? '';
    document.getElementById('EmployeeCode').value = emp?.employeeCode ?? '';
    document.getElementById('FirstName').value = emp?.firstName ?? '';
    document.getElementById('LastName').value = emp?.lastName ?? '';
    document.getElementById('Email').value = emp?.email ?? '';
    document.getElementById('ContactNo').value = emp?.contactNo ?? '';
    document.getElementById('Department').value = emp?.department ?? '';
    document.getElementById('Designation').value = emp?.designation ?? '';
    document.getElementById('IsActive').checked = emp ? emp.isActive : true;
}

function hideForm() {
    document.getElementById('employee-form').style.display = 'none';
}

async function saveEmployee(e) {
    e.preventDefault();
    const id = document.getElementById('EmployeeId').value;
    const payload = {
        employeeCode: document.getElementById('EmployeeCode').value,
        firstName: document.getElementById('FirstName').value,
        lastName: document.getElementById('LastName').value,
        email: document.getElementById('Email').value,
        contactNo: document.getElementById('ContactNo').value,
        department: document.getElementById('Department').value,
        designation: document.getElementById('Designation').value,
        isActive: document.getElementById('IsActive').checked
    };

    if (id) {
        await fetch(`${api}/${id}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    } else {
        await fetch(api, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    }

    hideForm();
    await fetchEmployees();
}

async function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    await fetch(`${api}/${id}`, {method: 'DELETE'});
    await fetchEmployees();
}

document.addEventListener('click', async (ev) => {
    if (ev.target.matches('#btn-refresh')) { await fetchEmployees(); }
    if (ev.target.matches('#btn-new')) { showForm(null); }
    if (ev.target.matches('#btn-cancel')) { hideForm(); }
    if (ev.target.matches('.edit')) {
        const id = ev.target.getAttribute('data-id');
        const res = await fetch(`${api}/${id}`);
        const emp = await res.json();
        showForm(emp);
    }
    if (ev.target.matches('.delete')) {
        const id = ev.target.getAttribute('data-id');
        await deleteEmployee(id);
    }
});

document.getElementById('form').addEventListener('submit', saveEmployee);

window.onload = () => fetchEmployees();
