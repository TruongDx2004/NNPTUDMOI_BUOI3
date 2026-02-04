const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortAsc = true;

/* FETCH DATA */
async function loadProducts() {
    const res = await fetch(API);
    products = await res.json();
    filtered = [...products];
    render();
}

loadProducts();

/* RENDER */
function render() {
    const start = (currentPage - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
        <tr title="${p.description}" onclick="openDetail(${p.id})">
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.category?.name}</td>
            <td><img src="${p.images[0]}" width="50"></td>
        </tr>`;
    });

    renderPagination();
}

/* SEARCH */
document.getElementById("searchInput").oninput = e => {
    const q = e.target.value.toLowerCase();
    filtered = products.filter(p => p.title.toLowerCase().includes(q));
    currentPage = 1;
    render();
};

/* PAGE SIZE */
document.getElementById("pageSize").onchange = e => {
    pageSize = +e.target.value;
    currentPage = 1;
    render();
};

/* PAGINATION */
function renderPagination() {
    const pages = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById("pagination");
    ul.innerHTML = "";

    for (let i = 1; i <= pages; i++) {
        ul.innerHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
            <button class="page-link" onclick="gotoPage(${i})">${i}</button>
        </li>`;
    }
}

function gotoPage(p) {
    currentPage = p;
    render();
}

/* SORT */
function sortBy(field) {
    sortAsc = sortField === field ? !sortAsc : true;
    sortField = field;

    filtered.sort((a, b) => {
        if (a[field] > b[field]) return sortAsc ? 1 : -1;
        if (a[field] < b[field]) return sortAsc ? -1 : 1;
        return 0;
    });

    render();
}

/* CSV EXPORT */
function exportCSV() {
    let csv = "id,title,price,category\n";
    filtered.slice((currentPage-1)*pageSize, currentPage*pageSize)
        .forEach(p => {
            csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
        });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
}

/* DETAIL */
function openDetail(id) {
    const p = products.find(x => x.id === id);
    document.getElementById("detailId").value = p.id;
    document.getElementById("detailTitle").value = p.title;
    document.getElementById("detailPrice").value = p.price;
    document.getElementById("detailDesc").value = p.description;

    new bootstrap.Modal("#detailModal").show();
}

/* UPDATE */
async function updateProduct() {
    const id = document.getElementById("detailId").value;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: detailTitle.value,
            price: +detailPrice.value,
            description: detailDesc.value
        })
    });

    loadProducts();
    bootstrap.Modal.getInstance(document.getElementById("detailModal")).hide();
}

/* CREATE */
function openCreateModal() {
    new bootstrap.Modal("#createModal").show();
}

async function createProduct() {
    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: createTitle.value,
            price: +createPrice.value,
            description: createDesc.value,
            categoryId: 1,
            images: [createImage.value]
        })
    });

    loadProducts();
    bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
}
