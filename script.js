/* ======================================
   NEXA ANALYTICS DASHBOARD
   Mock Data + Charts + Table
====================================== */

const customers = [
    { name: "Ayesha Khan", email: "ayesha@example.com", product: "Pro Plan", date: "2026-10-12", amount: 249, status: "Active" },
    { name: "Hamza Ali", email: "hamza@example.com", product: "Starter Plan", date: "2026-10-11", amount: 99, status: "Pending" },
    { name: "Sara Ahmed", email: "sara@example.com", product: "Enterprise", date: "2026-10-10", amount: 599, status: "Active" },
    { name: "Usman Raza", email: "usman@example.com", product: "Pro Plan", date: "2026-10-09", amount: 249, status: "Inactive" },
    { name: "Maham Noor", email: "maham@example.com", product: "Starter Plan", date: "2026-10-08", amount: 99, status: "Active" },
    { name: "Ali Hassan", email: "ali@example.com", product: "Enterprise", date: "2026-10-07", amount: 599, status: "Active" },
    { name: "Zoya Malik", email: "zoya@example.com", product: "Pro Plan", date: "2026-10-06", amount: 249, status: "Pending" },
    { name: "Bilal Ahmed", email: "bilal@example.com", product: "Starter Plan", date: "2026-10-05", amount: 99, status: "Inactive" },
    { name: "Hira Sheikh", email: "hira@example.com", product: "Enterprise", date: "2026-10-04", amount: 599, status: "Active" },
    { name: "Daniyal Shah", email: "daniyal@example.com", product: "Pro Plan", date: "2026-10-03", amount: 249, status: "Pending" },
    { name: "Fatima Iqbal", email: "fatima@example.com", product: "Starter Plan", date: "2026-10-02", amount: 99, status: "Active" },
    { name: "Ahmed Rauf", email: "ahmed@example.com", product: "Enterprise", date: "2026-10-01", amount: 599, status: "Active" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let currentPage = 1;
const rowsPerPage = 5;
let sortKey = "date";
let sortDirection = "desc";
let searchTerm = "";
let selectedStatus = "all";

let revenueChart;
let salesChart;
let performanceChart;
let analyticsRevenueChart;
let analyticsOrdersChart;

/* SAFE TEXT */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

/* CUSTOMER FILTERING */

function getFilteredCustomers() {
    return customers
        .filter(customer => {
            const searchable = [
                customer.name,
                customer.email,
                customer.product,
                customer.date,
                customer.amount,
                customer.status
            ].join(" ").toLowerCase();

            const matchesSearch = searchable.includes(searchTerm.toLowerCase());

            const matchesStatus =
                selectedStatus === "all" ||
                customer.status.toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let first = a[sortKey];
            let second = b[sortKey];

            if (sortKey === "amount") {
                first = Number(first);
                second = Number(second);
            } else {
                first = String(first).toLowerCase();
                second = String(second).toLowerCase();
            }

            if (first < second) {
                return sortDirection === "asc" ? -1 : 1;
            }

            if (first > second) {
                return sortDirection === "asc" ? 1 : -1;
            }

            return 0;
        });
}

/* CUSTOMER TABLE */

function renderCustomerTable() {
    const tbody = $("#customerTableBody");

    if (!tbody) return;

    const filtered = getFilteredCustomers();
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const visibleCustomers = filtered.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    if (visibleCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>No matching customers found.</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = visibleCustomers.map(customer => {
            const initials = customer.name
                .split(" ")
                .map(part => part[0])
                .slice(0, 2)
                .join("");

            const statusClass = {
                Active: "status-active",
                Pending: "status-pending",
                Inactive: "status-inactive"
            }[customer.status] || "";

            return `
                <tr>
                    <td>
                        <div class="customer-cell">
                            <div class="customer-avatar">
                                ${escapeHTML(initials)}
                            </div>
                            <div>
                                <span class="customer-name">
                                    ${escapeHTML(customer.name)}
                                </span>
                                <span class="customer-email">
                                    ${escapeHTML(customer.email)}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td>${escapeHTML(customer.product)}</td>
                    <td>${escapeHTML(customer.date)}</td>
                    <td>$${Number(customer.amount).toLocaleString()}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(customer.status)}
                        </span>
                    </td>
                    <td>
                        <button class="icon-button small-icon"
                            type="button"
                            aria-label="Customer options"
                            title="Customer options">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    const pageInfo = $("#pageInfo");
    const tableInfo = $("#tableInfo");
    const prevPage = $("#prevPage");
    const nextPage = $("#nextPage");

    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    if (tableInfo) {
        const first = filtered.length === 0 ? 0 : startIndex + 1;
        const last = Math.min(startIndex + rowsPerPage, filtered.length);

        tableInfo.textContent =
            `Showing ${first}-${last} of ${filtered.length} customers`;
    }

    if (prevPage) prevPage.disabled = currentPage <= 1;
    if (nextPage) nextPage.disabled = currentPage >= totalPages;
}

/* SEARCH AND FILTER EVENTS */

const globalSearch = $("#globalSearch");
const tableSearch = $("#tableSearch");
const statusFilter = $("#statusFilter");

if (globalSearch) {
    globalSearch.addEventListener("input", event => {
        searchTerm = event.target.value;
        if (tableSearch) tableSearch.value = searchTerm;
        currentPage = 1;
        renderCustomerTable();
    });
}

if (tableSearch) {
    tableSearch.addEventListener("input", event => {
        searchTerm = event.target.value;
        if (globalSearch) globalSearch.value = searchTerm;
        currentPage = 1;
        renderCustomerTable();
    });
}

if (statusFilter) {
    statusFilter.addEventListener("change", event => {
        selectedStatus = event.target.value;
        currentPage = 1;
        renderCustomerTable();
    });
}

const resetFilters = $("#resetFilters");

if (resetFilters) {
    resetFilters.addEventListener("click", () => {
        searchTerm = "";
        selectedStatus = "all";
        currentPage = 1;

        if (globalSearch) globalSearch.value = "";
        if (tableSearch) tableSearch.value = "";
        if (statusFilter) statusFilter.value = "all";

        renderCustomerTable();
    });
}

/* SORTING */

$$("[data-sort]").forEach(button => {
    button.addEventListener("click", () => {
        const newKey = button.dataset.sort;

        if (sortKey === newKey) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortKey = newKey;
            sortDirection = "asc";
        }

        currentPage = 1;
        renderCustomerTable();
    });
});

/* PAGINATION */

const prevPage = $("#prevPage");
const nextPage = $("#nextPage");

if (prevPage) {
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCustomerTable();
        }
    });
}

if (nextPage) {
    nextPage.addEventListener("click", () => {
        const totalPages = Math.max(
            1,
            Math.ceil(getFilteredCustomers().length / rowsPerPage)
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderCustomerTable();
        }
    });
}

/* INITIAL TABLE RENDER */

renderCustomerTable();
/* ======================================
   CHARTS - CHART.JS
====================================== */

const chartColors = {
    purple: "#a78bfa",
    blue: "#60a5fa",
    pink: "#f472b6",
    green: "#34d399",
    grid: "rgba(146,152,179,0.12)",
    text: "#9298b3"
};

function getChartTextColor() {
    return document.body.classList.contains("light-theme")
        ? "#777d98"
        : "#9298b3";
}

function getChartGridColor() {
    return document.body.classList.contains("light-theme")
        ? "rgba(35,40,75,0.10)"
        : "rgba(146,152,179,0.12)";
}

function makeGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, color + "55");
    gradient.addColorStop(1, color + "00");
    return gradient;
}

function createLineChart(canvasId, labels, values, label) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") return null;

    const ctx = canvas.getContext("2d");

    return new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderColor: chartColors.purple,
                backgroundColor: makeGradient(ctx, chartColors.purple),
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: chartColors.purple
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getChartTextColor()
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getChartGridColor()
                    },
                    ticks: {
                        color: getChartTextColor()
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

function createDoughnutChart(canvasId) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") return null;

    return new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Pro Plan", "Starter Plan", "Enterprise"],
            datasets: [{
                data: [45, 25, 30],
                backgroundColor: [
                    chartColors.purple,
                    chartColors.blue,
                    chartColors.pink
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createBarChart(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") return null;

    return new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Orders",
                data: values,
                backgroundColor: [
                    chartColors.purple,
                    chartColors.blue,
                    chartColors.pink,
                    chartColors.green,
                    "#818cf8",
                    "#38bdf8"
                ],
                borderRadius: 7,
                maxBarThickness: 35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getChartTextColor()
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getChartGridColor()
                    },
                    ticks: {
                        color: getChartTextColor(),
                        precision: 0
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

/* INITIALIZE ALL CHARTS */

function initializeCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is unavailable. Check your internet connection.");
        return;
    }

    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = getChartTextColor();

    revenueChart = createLineChart(
        "revenueChart",
        ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        [12000, 18500, 16000, 24000, 21000, 32000],
        "Revenue"
    );

    salesChart = createDoughnutChart("salesChart");

    performanceChart = createBarChart(
        "performanceChart",
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        [32, 48, 39, 65, 52, 78]
    );

    analyticsRevenueChart = createLineChart(
        "analyticsRevenueChart",
        ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        [12000, 18500, 16000, 24000, 21000, 32000],
        "Revenue"
    );

    analyticsOrdersChart = createBarChart(
        "analyticsOrdersChart",
        ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        [120, 175, 150, 230, 205, 290]
    );
}

initializeCharts();

/* REVENUE PERIOD FILTER */

const revenuePeriod = $("#revenuePeriod");

if (revenuePeriod) {
    revenuePeriod.addEventListener("change", event => {
        if (!revenueChart) return;

        const period = event.target.value.toLowerCase();

        let labels;
        let values;

        if (period.includes("week")) {
            labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            values = [2400, 3100, 2800, 4200, 3600, 5100, 4700];
        } else if (period.includes("year")) {
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
            values = [18000, 22000, 19500, 27000, 30000, 35000];
        } else {
            labels = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
            values = [12000, 18500, 16000, 24000, 21000, 32000];
        }

        revenueChart.data.labels = labels;
        revenueChart.data.datasets[0].data = values;
        revenueChart.update();
    });
}

/* ======================================
   DARK / LIGHT THEME
====================================== */

function updateThemeButtons() {
    const isLight = document.body.classList.contains("light-theme");
    const themeButton = $("#themeToggle");
    const settingsToggle = $("#settingsThemeToggle");

    if (themeButton) {
        themeButton.innerHTML = isLight
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>';

        themeButton.setAttribute(
            "aria-label",
            isLight ? "Switch to dark mode" : "Switch to light mode"
        );
    }

    if (settingsToggle && "checked" in settingsToggle) {
        settingsToggle.checked = isLight;
    }

    if (typeof Chart !== "undefined") {
        Chart.defaults.color = getChartTextColor();

        [
            revenueChart,
            salesChart,
            performanceChart,
            analyticsRevenueChart,
            analyticsOrdersChart
        ].forEach(chart => {
            if (!chart) return;

            if (chart.options.scales) {
                Object.values(chart.options.scales).forEach(scale => {
                    if (scale.ticks) {
                        scale.ticks.color = getChartTextColor();
                    }

                    if (scale.grid) {
                        scale.grid.color = getChartGridColor();
                    }
                });
            }

            chart.update();
        });
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");

    try {
        localStorage.setItem("nexa-theme", isLight ? "light" : "dark");
    } catch (error) {
        console.warn("Theme preference could not be saved.");
    }

    updateThemeButtons();
}

try {
    if (localStorage.getItem("nexa-theme") === "light") {
        document.body.classList.add("light-theme");
    }
} catch (error) {
    console.warn("Saved theme preference is unavailable.");
}

const themeToggle = $("#themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

const settingsThemeToggle = $("#settingsThemeToggle");

if (settingsThemeToggle) {
    settingsThemeToggle.addEventListener("change", event => {
        const shouldBeLight = event.target.checked;
        const currentlyLight = document.body.classList.contains("light-theme");

        if (shouldBeLight !== currentlyLight) {
            toggleTheme();
        }
    });
}

updateThemeButtons();

/* ======================================
   MULTI-VIEW NAVIGATION
====================================== */

function showView(viewName) {
    const targetView = document.getElementById(viewName + "View");

    if (!targetView) return;

    $$(".page-view").forEach(view => {
        view.classList.remove("active-view");
    });

    targetView.classList.add("active-view");

    $$("[data-view]").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.view === viewName
        );
    });

    const breadcrumbTitle = $("#breadcrumbTitle");

    if (breadcrumbTitle) {
        const titles = {
            overview: "Overview",
            analytics: "Analytics",
            customers: "Customers",
            reports: "Reports",
            settings: "Settings"
        };

        breadcrumbTitle.textContent = titles[viewName] || "Overview";
    }

    try {
        history.replaceState(null, "", "#" + viewName);
    } catch (error) {
        // Navigation still works if browser history is unavailable.
    }

    const sidebar = $(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("sidebar-open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

$$("[data-view]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showView(link.dataset.view);
    });
});

$$("[data-go-view]").forEach(button => {
    button.addEventListener("click", () => {
        showView(button.dataset.goView);
    });
});

const initialView = location.hash.replace("#", "");

if (document.getElementById(initialView + "View")) {
    showView(initialView);
} else {
    showView("overview");
}

/* MOBILE SIDEBAR */

const menuToggle = $(".menu-toggle");
const sidebar = $(".sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar-open");
    });
}

document.addEventListener("click", event => {
    if (!sidebar || !sidebar.classList.contains("sidebar-open")) return;

    if (
        !sidebar.contains(event.target) &&
        menuToggle &&
        !menuToggle.contains(event.target)
    ) {
        sidebar.classList.remove("sidebar-open");
    }
});

/* ======================================
   TOAST NOTIFICATIONS
====================================== */

function showToast(message) {
    const toast = $("#toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    if (showToast.timeout) {
        clearTimeout(showToast.timeout);
    }

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

const notificationButton = $(".notification-button");

if (notificationButton) {
    notificationButton.addEventListener("click", () => {
        showToast("You're all caught up!");
    });
}

/* ======================================
   EXPORT CUSTOMER REPORT AS CSV
====================================== */

function exportCustomerReport() {
    const filtered = getFilteredCustomers();

    if (filtered.length === 0) {
        showToast("No customer records to export.");
        return;
    }

    const headers = [
        "Name",
        "Email",
        "Product",
        "Date",
        "Amount",
        "Status"
    ];

    const rows = filtered.map(customer => [
        customer.name,
        customer.email,
        customer.product,
        customer.date,
        customer.amount,
        customer.status
    ]);

    const csvCell = value => {
        let text = String(value);

        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    };

    const csvContent = [headers, ...rows]
        .map(row => row.map(csvCell).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "nexa-customer-report.csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(url);

    showToast("Customer report exported successfully!");
}

$$("[data-export-report]").forEach(button => {
    button.addEventListener("click", exportCustomerReport);
});

/* ======================================
   FOOTER YEAR
====================================== */

const yearElement = $("#currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

console.log("Nexa Analytics Dashboard initialized successfully.");