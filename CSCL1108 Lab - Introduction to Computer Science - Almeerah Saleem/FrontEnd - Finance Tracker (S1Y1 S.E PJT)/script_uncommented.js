// 1. GLOBAL SETUP & DATA LOADING

let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('historyBody')) {
        renderIncomeTable();
        const addBtn = document.querySelector('.controls-row button.btn-action');
        if (addBtn) addBtn.addEventListener('click', addIncome);
        const filterBtn = document.getElementById('btnFilterIncome');
        if (filterBtn) filterBtn.addEventListener('click', applyIncomeFilters);
    }

    if (document.getElementById('expenseTable')) {
        renderExpensePage();
        const filterExpBtn = document.getElementById('btnFilterExpense');
        if (filterExpBtn) filterExpBtn.addEventListener('click', applyExpenseFilters);
    }

    if (document.getElementById('expThis')) {
        updateDashboard();
    }

    if (document.getElementById('totalBalance')) {
        updateProfile();
    }
});


// 2. HELPER FUNCTIONS

function toggleCustomDate(value) {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    if (startInput && endInput) {
        if (value === 'Custom') {
            startInput.style.display = 'inline-block';
            endInput.style.display = 'inline-block';
        } else {
            startInput.style.display = 'none';
            endInput.style.display = 'none';
        }
    }
}


// UPDATED HELPER FUNCTION: Rolling Date Ranges

function isDateInRange(dateStr, range, customStart, customEnd) {
    const d = new Date(dateStr);
    const today = new Date();

    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (range === 'All') return true;

    if (range === 'LastMonth') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        oneMonthAgo.setHours(0, 0, 0, 0);
        return d >= oneMonthAgo;
    }

    if (range === 'Last3Months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        threeMonthsAgo.setHours(0, 0, 0, 0);
        return d >= threeMonthsAgo;
    }

    if (range === 'Last6Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        return d >= sixMonthsAgo;
    }

    if (range === 'LastYear') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);
        return d >= oneYearAgo;
    }

    if (range === 'Custom' && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
    }

    return true;
}


// 3. LOGIN FUNCTION

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "admin" && password === "admin") {
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect username or password!");
    }
}


// 4. ADD EXPENSE (Universal)

function addExpense() {
    let dateEl = document.getElementById("date");
    let catEl = document.getElementById("category");
    let itemEl = document.getElementById("spentOn");
    let amountEl = document.getElementById("amount");

    if (!dateEl) {
        dateEl = document.getElementById("expenseDate");
        catEl = document.getElementById("expenseCategory");
        itemEl = document.getElementById("expenseItem");
        amountEl = document.getElementById("expenseAmount");
    }

    if (!dateEl || !amountEl) return;

    if (dateEl.value === "" || amountEl.value === "") {
        alert("Please fill in the date and amount.");
        return;
    }

    const newExpense = {
        date: dateEl.value,
        category: catEl ? catEl.value : "General",
        spentOn: itemEl ? itemEl.value : "Unknown",
        amount: parseFloat(amountEl.value)
    };

    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    if (document.getElementById('expenseTable')) {
        renderExpensePage();
    } else {
        updateDashboard();
    }

    dateEl.value = "";
    if (itemEl) itemEl.value = "";
    amountEl.value = "";
}


// 5. EXPENSE FILTERING & RENDER

function applyExpenseFilters() {
    const category = document.getElementById('recentCategory').value;
    const dateRange = document.getElementById('filterDateRange').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filtered = expenses.filter(exp => {
        const matchCat = (category === 'All Categories' || category === exp.category);
        const matchDate = isDateInRange(exp.date, dateRange, startDate, endDate);
        return matchCat && matchDate;
    });

    renderExpensePage(filtered);
}

function renderExpensePage(filteredData = expenses) {
    const mainTable = document.getElementById('expenseTable');
    const recentTable = document.getElementById('recentExpenses');

    if (!mainTable && !recentTable) return;

    const generateRow = (exp) => `
        <tr>
        </tr>
    `;

    if (mainTable) {
        mainTable.innerHTML = "";
        const allExpensesReversed = expenses.slice().reverse();

        if (allExpensesReversed.length === 0) {
            mainTable.innerHTML = "<tr><td colspan='4'>No expenses found</td></tr>";
        } else {
            allExpensesReversed.forEach(exp => {
                mainTable.innerHTML += generateRow(exp);
            });
        }
    }

    if (recentTable) {
        recentTable.innerHTML = "";
        const filteredReversed = filteredData.slice().reverse();

        if (filteredReversed.length === 0) {
            recentTable.innerHTML = "<tr><td colspan='3'>No expenses found</td></tr>";
        } else {
            filteredReversed.forEach(exp => {
                recentTable.innerHTML += `
                    <tr>
                        <td>${exp.date || '-'}</td>
                        <td>${exp.category}</td>
                        <td>${exp.spentOn}</td>
                        <td>PKR ${exp.amount}</td>
                    </tr>
                `;
            });
        }
    }

    const monthlyDisplay = document.getElementById('monthlyExp');
    if (monthlyDisplay) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let totalThisMonth = 0;

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                totalThisMonth += Number(exp.amount);
            }
        });
        monthlyDisplay.innerText = "PKR " + totalThisMonth;
    }
}


// 6. INCOME FILTERING & RENDER

function addIncome() {
    const dateInput = document.getElementById("inputDate");
    const sourceInput = document.getElementById("inputSource");
    const amountInput = document.getElementById("inputAmount");
    const methodInput = document.getElementById("inputMethod");

    if (!dateInput.value || !amountInput.value) {
        alert("Please select a date and enter an amount.");
        return;
    }

    const newIncome = {
        date: dateInput.value,
        source: sourceInput.value,
        amount: parseFloat(amountInput.value),
        method: methodInput.value
    };

    incomes.push(newIncome);
    localStorage.setItem('incomes', JSON.stringify(incomes));

    renderIncomeTable();
    dateInput.value = "";
    amountInput.value = "";
}

function applyIncomeFilters() {
    const source = document.getElementById('filterSource').value;
    const dateRange = document.getElementById('filterDateRange').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filtered = incomes.filter(inc => {
        const matchSource = (source === 'All' || source === 'All Sources' || source === inc.source);
        const matchDate = isDateInRange(inc.date, dateRange, startDate, endDate);
        return matchSource && matchDate;
    });

    renderIncomeTable(filtered);
}

function renderIncomeTable(data = incomes) {
    const historyBody = document.getElementById('historyBody');
    const totalDisplay = document.getElementById('totalAmountDisplay');

    if (!historyBody) return;

    historyBody.innerHTML = "";

    const listToRender = data.slice().reverse();

    if (listToRender.length === 0) {
        historyBody.innerHTML = "<tr><td colspan='4'>No transactions found</td></tr>";
    } else {
        listToRender.forEach(income => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${income.date}</td>
                <td>${income.source}</td>
                <td>PKR ${income.amount}</td>
                <td>${income.method}</td>
            `;
            historyBody.appendChild(row);
        });
    }

    if (totalDisplay) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let currentMonthTotal = 0;

        incomes.forEach(inc => {
            const d = new Date(inc.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                currentMonthTotal += Number(inc.amount);
            }
        });
        totalDisplay.innerText = "PKR " + currentMonthTotal;
    }
}


// 7. DASHBOARD LOGIC

function updateDashboard() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let expenseThisMonth = 0;
    let expenseLastMonth = 0;

    expenses.forEach(exp => {
        const d = new Date(exp.date);
        const amt = Number(exp.amount);

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            expenseThisMonth += amt;
        }

        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentMonth - 1);
        if (d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()) {
            expenseLastMonth += amt;
        }
    });

    let incomeThisMonth = 0;
    let incomeLastMonth = 0;

    incomes.forEach(inc => {
        const d = new Date(inc.date);
        const amt = Number(inc.amount);

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            incomeThisMonth += amt;
        }

        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentMonth - 1);
        if (d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()) {
            incomeLastMonth += amt;
        }
    });

    const ids = {
        expThis: expenseThisMonth,
        expLast: expenseLastMonth,
        incThis: incomeThisMonth,
        incLast: incomeLastMonth
    };

    for (let id in ids) {
        const el = document.getElementById(id);
        if (el) el.innerText = ids[id];
    }

    const expenseList = document.getElementById("expenseList");
    if (expenseList) {
        expenseList.innerHTML = "";
        const recentExps = expenses.slice(-3).reverse();
        if (recentExps.length === 0) {
            expenseList.innerHTML = "<li>No expenses yet</li>";
        } else {
            recentExps.forEach(exp => {
                expenseList.innerHTML += `<li><span><b>${exp.category} • ${exp.spentOn}</b></span><span class="amount red">PKR ${exp.amount}</span></li>`;
            });
        }
    }

    const incomeList = document.getElementById("incomeList");
    if (incomeList) {
        incomeList.innerHTML = "";
        const recentIncs = incomes.slice(-3).reverse();
        if (recentIncs.length === 0) {
            incomeList.innerHTML = "<li><span>—</span><span class='amount green'>PKR 0</span></li>";
        } else {
            recentIncs.forEach(inc => {
                incomeList.innerHTML += `<li><span><b>${inc.source}</b></span><span class="amount green">PKR ${inc.amount}</span></li>`;
            });
        }
    }
}


// 8. PROFILE PAGE LOGIC

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('totalBalance')) {
        updateProfile();
    }
});

function updateProfile() {
    const incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    incomes.forEach(inc => {
        const d = new Date(inc.date);
        const amt = Number(inc.amount);

        totalIncome += amt;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyIncome += amt;
        }
    });

    expenses.forEach(exp => {
        const d = new Date(exp.date);
        const amt = Number(exp.amount);

        totalExpense += amt;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyExpense += amt;
        }
    });

    const totalBalance = totalIncome - totalExpense;
    const monthlySavings = monthlyIncome - monthlyExpense;

    const setUI = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = "PKR " + value.toLocaleString();
    };

    setUI("totalBalance", totalBalance);
    setUI("monthlyIncome", monthlyIncome);
    setUI("monthlyExpenses", monthlyExpense);
    setUI("savings", monthlySavings);
}


// 9. EDIT PROFILE LOGIC

document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.getElementById('editProfile');
    if (editBtn) {
        loadProfileData();
        editBtn.addEventListener('click', handleProfileEdit);
    }
});

function loadProfileData() {
    const profile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: "Anonymous",
        role: "New Member",
        email: "user@example.com",
        img: "assets/avatar-1.png"
    };

    if (document.getElementById('name')) {
        document.getElementById('name').innerText = profile.name;
        document.getElementById('role').innerText = profile.role;
        document.getElementById('email').innerText = profile.email;
    }

    if (document.getElementById('profileImg') && profile.img) {
        document.getElementById('profileImg').src = profile.img;
    }
}

function handleProfileEdit() {
    const nameEl = document.getElementById('name');
    const roleEl = document.getElementById('role');
    const emailEl = document.getElementById('email');
    const imgEl = document.getElementById('profileImg');

    const newName = prompt("Enter your name:", nameEl.innerText);
    const newRole = prompt("Enter your role:", roleEl.innerText);
    const newEmail = prompt("Enter your email:", emailEl.innerText);
    const newImg = prompt("Enter image URL or Path (e.g., assets/avatar-2.png):", imgEl.src);

    if (newName && newRole && newEmail) {
        const updatedProfile = {
            name: newName,
            role: newRole,
            email: newEmail,
            img: newImg || imgEl.src
        };

        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        loadProfileData();
        alert("Profile updated successfully!");
    }
}