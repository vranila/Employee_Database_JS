// ==============================
// STATE MANAGEMENT
// ==============================

let employees = JSON.parse(localStorage.getItem("employees")) || [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "123456789012",
        dob: "1995-05-10",
        salary: 75000,
        image: "https://i.pravatar.cc/150?img=1"
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "987654321098",
        dob: "1993-08-21",
        salary: 92000,
        image: "https://i.pravatar.cc/150?img=2"
    }
];

let selectedEmployeeId = null;
let editMode = false;
let editId = null;

const itemsPerPage = 5;
let currentPage = 1;


// ==============================
// DOM ELEMENTS
// ==============================

const employeeList = document.getElementById("employeeList");
const detailView = document.getElementById("detailView");
const modal = document.getElementById("modal");
const form = document.getElementById("employeeForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const pagination = document.getElementById("pagination");


// ==============================
// UTILITIES
// ==============================

function saveToLocalStorage() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function formatSalary(salary) {
    return "$" + Number(salary).toLocaleString();
}

function validateName(name) {
    return /^[A-Za-z]+$/.test(name);
}

function validatePhone(phone) {
    return /^[0-9]{12}$/.test(phone);
}


// ==============================
// RENDER LIST
// ==============================

function renderList() {
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm)
    );

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    employeeList.innerHTML = "";

    if (paginated.length === 0) {
        employeeList.innerHTML = "<p>No employees found</p>";
        return;
    }

    paginated.forEach(emp => {
        const div = document.createElement("div");
        div.className = "employee-item";
        div.innerText = emp.firstName + " " + emp.lastName;

        div.onclick = () => {
            selectedEmployeeId = emp.id;
            renderDetails();
        };

        employeeList.appendChild(div);
    });

    renderPagination(filtered.length);
}


// ==============================
// RENDER DETAILS
// ==============================

function renderDetails() {
    const emp = employees.find(e => e.id === selectedEmployeeId);

    if (!emp) {
        detailView.innerHTML = "<p>Select an employee to view details</p>";
        return;
    }

    detailView.innerHTML = `
        <img src="${emp.image}" width="120">
        <h2>${emp.firstName} ${emp.lastName}</h2>
        <p><strong>Email:</strong> ${emp.email}</p>
        <p><strong>Phone:</strong> ${emp.phone}</p>
        <p><strong>DOB:</strong> ${emp.dob}</p>
        <p><strong>Salary:</strong> ${formatSalary(emp.salary)}</p>
        <button onclick="editEmployee(${emp.id})">Edit</button>
        <button onclick="deleteEmployee(${emp.id})">Delete</button>
    `;
}


// ==============================
// PAGINATION
// ==============================

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;

        if (i === currentPage) {
            btn.style.fontWeight = "bold";
        }

        btn.onclick = () => {
            currentPage = i;
            renderList();
        };

        pagination.appendChild(btn);
    }
}


// ==============================
// ADD / UPDATE
// ==============================

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const dob = form.dob.value;
    const salary = form.salary.value;
    const image = form.image.value;

    if (!validateName(firstName)) {
        alert("First name must contain letters only.");
        return;
    }

    if (!validateName(lastName)) {
        alert("Last name must contain letters only.");
        return;
    }

    if (!validatePhone(phone)) {
        alert("Phone number must be exactly 12 digits.");
        return;
    }

    if (editMode) {
        const emp = employees.find(e => e.id === editId);
        emp.firstName = firstName;
        emp.lastName = lastName;
        emp.email = email;
        emp.phone = phone;
        emp.dob = dob;
        emp.salary = salary;
        emp.image = image;

        editMode = false;
        editId = null;
    } else {
        const newEmployee = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            dob,
            salary,
            image
        };
        employees.push(newEmployee);
    }

    saveToLocalStorage();
    form.reset();
    closeModal();
    renderList();
});


// ==============================
// EDIT FUNCTION
// ==============================

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);

    form.firstName.value = emp.firstName;
    form.lastName.value = emp.lastName;
    form.email.value = emp.email;
    form.phone.value = emp.phone;
    form.dob.value = emp.dob;
    form.salary.value = emp.salary;
    form.image.value = emp.image;

    editMode = true;
    editId = id;
    openModal();
}


// ==============================
// DELETE FUNCTION
// ==============================

function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    employees = employees.filter(emp => emp.id !== id);
    selectedEmployeeId = null;

    saveToLocalStorage();
    renderList();
    renderDetails();
}


// ==============================
// SEARCH
// ==============================

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderList();
});

searchBtn.addEventListener("click", () => {
    currentPage = 1;
    renderList();
});


// ==============================
// MODAL CONTROL
// ==============================

function openModal() {
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}


// ==============================
// INITIAL LOAD
// ==============================

renderList();
renderDetails();