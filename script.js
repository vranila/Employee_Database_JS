/* ========= STATE ========= */

let employees = JSON.parse(localStorage.getItem("employees")) || [];
let selectedEmployeeId = null;
let editMode = false;
let editId = null;

const ITEMS_PER_PAGE = 5;
let currentPage = 1;

/* ========= DOM ========= */

const employeeList = document.getElementById("employeeList");
const detailView = document.getElementById("detailView");
const form = document.getElementById("employeeForm");
const modal = document.getElementById("modal");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const roleFilter = document.getElementById("roleFilter");
const pagination = document.getElementById("pagination");
const toastContainer = document.getElementById("toastContainer");
const addBtn = document.getElementById("addEmployeeBtn");
const cancelBtn = document.getElementById("cancelBtn");
const exportBtn = document.getElementById("exportBtn");
const themeToggle = document.getElementById("themeToggle");

/* ========= UTILITIES ========= */

function saveToLocalStorage() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function validateName(name) {
    return /^[A-Za-z]+$/.test(name);
}

function validatePhone(phone) {
    return /^[0-9]{12}$/.test(phone);
}

/* ========= RENDER ========= */

function renderList() {
    let filtered = [...employees];

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(emp =>
            emp.firstName.toLowerCase().includes(searchTerm) ||
            emp.lastName.toLowerCase().includes(searchTerm)
        );
    }

    if (roleFilter.value) {
        filtered = filtered.filter(emp => emp.role === roleFilter.value);
    }

    if (sortSelect.value === "name") {
        filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
    }

    if (sortSelect.value === "salary") {
        filtered.sort((a, b) => a.salary - b.salary);
    }

    if (sortSelect.value === "dob") {
        filtered.sort((a, b) => new Date(a.dob) - new Date(b.dob));
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    employeeList.innerHTML = "";

    paginated.forEach(emp => {
        const div = document.createElement("div");
        div.className = "employee-item";
        div.innerText = `${emp.firstName} ${emp.lastName}`;
        div.onclick = () => {
            selectedEmployeeId = emp.id;
            renderDetails();
        };
        employeeList.appendChild(div);
    });

    renderPagination(filtered.length);
}

function renderDetails() {
    const emp = employees.find(e => e.id === selectedEmployeeId);

    if (!emp) {
        detailView.innerHTML = "<p>Select an employee to view details</p>";
        return;
    }

    detailView.innerHTML = `
        <img src="${emp.image}" width="120">
        <h2>${emp.firstName} ${emp.lastName}</h2>
        <p>Role: ${emp.role}</p>
        <p>Email: ${emp.email}</p>
        <p>Phone: ${emp.phone}</p>
        <p>DOB: ${emp.dob}</p>
        <p>Salary: $${Number(emp.salary).toLocaleString()}</p>
        <button onclick="editEmployee(${emp.id})">Edit</button>
        <button onclick="deleteEmployee(${emp.id})">Delete</button>
    `;
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.onclick = () => {
            currentPage = i;
            renderList();
        };
        pagination.appendChild(btn);
    }
}

/* ========= CRUD ========= */

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    if (!validateName(data.firstName) || !validateName(data.lastName)) {
        showToast("Names must contain letters only");
        return;
    }

    if (!validatePhone(data.phone)) {
        showToast("Phone must be exactly 12 digits");
        return;
    }

    if (editMode) {
        const emp = employees.find(e => e.id === editId);
        Object.assign(emp, data);
        editMode = false;
        showToast("Employee updated successfully");
    } else {
        data.id = Date.now();
        employees.push(data);
        showToast("Employee added successfully");
    }

    saveToLocalStorage();
    form.reset();
    closeModal();
    renderList();
});

/* ========= OTHER FUNCTIONS ========= */

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);

    for (let key in emp) {
        if (form[key]) form[key].value = emp[key];
    }

    editMode = true;
    editId = id;
    openModal();
}

function deleteEmployee(id) {
    employees = employees.filter(emp => emp.id !== id);
    selectedEmployeeId = null;
    saveToLocalStorage();
    renderList();
    renderDetails();
    showToast("Employee deleted successfully");
}

function openModal() {
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

/* ========= EVENTS ========= */

addBtn.onclick = openModal;
cancelBtn.onclick = closeModal;
searchInput.oninput = () => { currentPage = 1; renderList(); };
sortSelect.onchange = renderList;
roleFilter.onchange = renderList;
themeToggle.onclick = () => document.body.classList.toggle("light");

exportBtn.onclick = function () {
    let csv = "First Name,Last Name,Email,Phone,DOB,Salary,Role\n";
    employees.forEach(emp => {
        csv += `${emp.firstName},${emp.lastName},${emp.email},${emp.phone},${emp.dob},${emp.salary},${emp.role}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
};

/* ========= INITIALIZE ========= */

renderList();
renderDetails();