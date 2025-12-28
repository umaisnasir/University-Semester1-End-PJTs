// 1. GLOBAL SETUP & DATA LOADING

// Load saved data from the browser's memory (LocalStorage).
// If there is no saved data yet, we start with an empty list [].
let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Wait until the website's HTML is completely ready before running any code.
// We do this to make sure all the buttons and boxes exist before we try to click them.
document.addEventListener("DOMContentLoaded", () => {

    // A. Check if we are on the INCOME PAGE
    // We look for 'historyBody' (the table). If it exists, we know we are on Income.html.
    if (document.getElementById('historyBody')) {
        renderIncomeTable(); // Show the table immediately
        
        // Find the 'Add' button and tell it to run addIncome() when clicked
        const addBtn = document.querySelector('.controls-row button.btn-action');
        if (addBtn) addBtn.addEventListener('click', addIncome);
        
        // Find the 'Apply Filter' button and connect it
        const filterBtn = document.getElementById('btnFilterIncome');
        if (filterBtn) filterBtn.addEventListener('click', applyIncomeFilters);
    }

    // B. Check if we are on the EXPENSES PAGE
    // We look for 'expenseTable'. If found, we are on Expenses.html.
    if (document.getElementById('expenseTable')) {
        renderExpensePage(); // Show the expenses list
        
        // Connect the 'Apply Filter' button for expenses
        const filterExpBtn = document.getElementById('btnFilterExpense');
        if (filterExpBtn) filterExpBtn.addEventListener('click', applyExpenseFilters);
    }

    // C. Check if we are on the DASHBOARD
    // We look for 'expThis' (a specific number on the dashboard). 
    // If it exists, we calculate and update all the dashboard stats.
    if (document.getElementById('expThis')) {
        updateDashboard();
    }

    // D. Check if we are on the PROFILE PAGE
    // We look for 'totalBalance'. If found, we calculate the user's total wealth.
    if (document.getElementById('totalBalance')) {
        updateProfile();
    }
});


// 2. HELPER FUNCTIONS

// This function controls whether the manual date pickers show up.
// It runs whenever the user changes the "Time Period" dropdown.
function toggleCustomDate(value) {
    // 1. Grab the two date input boxes from the screen
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    // 2. Only proceed if these boxes actually exist on this page
    if (startInput && endInput) {
        
        // 3. If the user selected "Custom", reveal the boxes so they can pick dates
        if (value === 'Custom') {
            startInput.style.display = 'inline-block';
            endInput.style.display = 'inline-block';
        } 
        // 4. Otherwise (for "Last Month", "Last Year", etc.), keep them hidden to keep the UI clean
        else {
            startInput.style.display = 'none';
            endInput.style.display = 'none';
        }
    }
}


// UPDATED HELPER FUNCTION: Rolling Date Ranges


// This function determines if a specific date (dateStr) falls within a selected time range.
// It supports rolling ranges (e.g., "Last 30 days") and custom start/end dates.

function isDateInRange(dateStr, range, customStart, customEnd) {
    // 1. Convert the input date string into a Date object
    const d = new Date(dateStr);
    const today = new Date();

    // 2. Normalize the time to Midnight (00:00:00)
    // This ensures we strictly compare dates (Day/Month/Year) without time affecting the result.
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // 3. If "All" is selected, don't filter anything (always return true)
    if (range === 'All') return true;

    // 4. Handle "Last Month" (Rolling 30-day window)
    if (range === 'LastMonth') {
        const oneMonthAgo = new Date();
        // Subtract 1 month from today
        oneMonthAgo.setMonth(today.getMonth() - 1);
        oneMonthAgo.setHours(0, 0, 0, 0);
        // Return true if the date 'd' is newer than or equal to one month ago
        return d >= oneMonthAgo;
    }

    // 5. Handle "Last 3 Months" (Rolling 90-day window)
    if (range === 'Last3Months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        threeMonthsAgo.setHours(0, 0, 0, 0);
        return d >= threeMonthsAgo;
    }

    // 6. Handle "Last 6 Months"
    if (range === 'Last6Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        return d >= sixMonthsAgo;
    }

    // 7. Handle "Last Year" (Rolling 365-day window)
    if (range === 'LastYear') {
        const oneYearAgo = new Date();
        // Subtract 1 year from today
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);
        return d >= oneYearAgo;
    }

    // 8. Handle "Custom" Range
    // Requires both a start date and an end date to function
    if (range === 'Custom' && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        // Normalize custom dates to midnight as well
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        // Return true only if 'd' is between start and end (inclusive)
        return d >= start && d <= end;
    }

    // Default fallback (though usually caught by 'All')
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


// It attempts to find the HTML input elements using the IDs specific to the Dashboard page 
// (date, category, spentOn, amount).

function addExpense() {
    let dateEl = document.getElementById("date");
    let catEl = document.getElementById("category");
    let itemEl = document.getElementById("spentOn");
    let amountEl = document.getElementById("amount");

//  checks if the dateEl was found in the previous step, if its null,
//  that means we are not on dashboard
//  it tries to find the elements using the IDs specific to the expenses page

    if (!dateEl) {
        dateEl = document.getElementById("expenseDate");
        catEl = document.getElementById("expenseCategory");
        itemEl = document.getElementById("expenseItem");
        amountEl = document.getElementById("expenseAmount");
    }

//  If the function still cannot find a date or amount input (perhaps on a page where this feature doesn't exist), 
//  it stops running immediately (return) to prevent errors.

    if (!dateEl || !amountEl) return; 

// it checks if the user left the "Date" or "Amount" fields empty,
// it shows an alert on the screen.

    if (dateEl.value === "" || amountEl.value === "") {
        alert("Please fill in the date and amount.");
        return;
    }

// it creates a js object 'newExpense'.

// for category and spentOn, it checks if the element exists (catEl), (spentOn). If yes,
// it uses its value, for e.g. if there's no value, it assigns a default string,
// like 'general' or 'unknown'

    const newExpense = {
        date: dateEl.value,
        category: catEl ? catEl.value : "General",
        spentOn: itemEl ? itemEl.value : "Unknown",
        amount: parseFloat(amountEl.value)
    };

// adds the new expense object to the global list of expenses
// localStorage.setItem('expenses', JSON.stringify(expenses));

// Converts the entire list to a string (JSON.stringify) 
// and saves it in the browser's storage. This ensures the 
// data is not lost when the user refreshes or closes the page.


    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

// if the element 'expenseTable' exists, we are on the 'Expenses Page', so
// it runs renderExpensePage() to update the table rows.

// Otherwise, we are likely on the dashboard, so it runs updateDashboard() to update
// the recents list.

    if (document.getElementById('expenseTable')) {
        renderExpensePage(); 
    } else {
        updateDashboard();   
    }

// It clears the text inside the input fields. This resets the form so the user
// can easily add a new entry without deleting the old text manually.

    dateEl.value = "";
    if (itemEl) itemEl.value = "";
    amountEl.value = "";
}


// 5. EXPENSE FILTERING & RENDER


// Gather user inputs from the filter controls and create a temporary list of matching expenses
function applyExpenseFilters() {
    // Retrieve current values from dropdowns and date pickers
    const category = document.getElementById('recentCategory').value; 
    const dateRange = document.getElementById('filterDateRange').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Filter the global 'expenses' array based on the selected criteria
    const filtered = expenses.filter(exp => {
        // Check if the expense matches the selected category or if "All Categories" is active
        const matchCat = (category === 'All Categories' || category === exp.category);
        
        // Verify if the expense date falls within the selected range using the helper function
        const matchDate = isDateInRange(exp.date, dateRange, startDate, endDate);
        
        return matchCat && matchDate;
    });

    // Render the view using only the filtered subset of data
    renderExpensePage(filtered);
}


// Render the expense tables and summary information; defaults to all expenses if no filter is provided
function renderExpensePage(filteredData = expenses) {
    const mainTable = document.getElementById('expenseTable'); 
    const recentTable = document.getElementById('recentExpenses'); 

    // Exit early if neither table exists in the DOM to prevent errors
    if (!mainTable && !recentTable) return;

    // Helper function to generate the HTML structure for a single table row
    const generateRow = (exp) => `
        <tr>
        </tr>
    `;

    // Render the Main Table using the global 'expenses' array (unfiltered)
    if (mainTable) {
        mainTable.innerHTML = "";
        
        // Create a shallow copy of the array and reverse it so the newest expenses appear first
        const allExpensesReversed = expenses.slice().reverse(); 
        
        // Handle the case where the global list is empty
        if (allExpensesReversed.length === 0) {  
            mainTable.innerHTML = "<tr><td colspan='4'>No expenses found</td></tr>";
        } else {
            allExpensesReversed.forEach(exp => {
                mainTable.innerHTML += generateRow(exp);
            });
        }
    }

    // Render the Recent Table using the 'filteredData' argument
    if (recentTable) {
        // Clear existing table content before re-rendering
        recentTable.innerHTML = "";  
        
        // Create a reversed copy of the filtered data for display purposes
        const filteredReversed = filteredData.slice().reverse(); 
        
        // Display a user-friendly message if the filter results are empty
        if (filteredReversed.length === 0) {  
            recentTable.innerHTML = "<tr><td colspan='3'>No expenses found</td></tr>";  
        } else {  
            // Iterate through the filtered list and inject HTML for each row
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

    // Update the Monthly Total based on the global data
    const monthlyDisplay = document.getElementById('monthlyExp');
    
    if (monthlyDisplay) { 
        // specific context for current date to compare against expenses
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let totalThisMonth = 0;
        
        // Iterate through all expenses to sum up amounts for the current month and year
        expenses.forEach(exp => {  
            const d = new Date(exp.date); 
            
            // Check if expense month and year match the current date
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {  
                totalThisMonth += Number(exp.amount); 
            }
        });

        // Update the DOM element with the formatted total
        monthlyDisplay.innerText = "PKR " + totalThisMonth;
    }
}


// 6. INCOME FILTERING & RENDER


// this function collects income form values,
// creates a js object `newIncome`,
// saves it to array + localStorage,
// and then re-renders the table
function addIncome() {

    // get input elements from DOM
    const dateInput = document.getElementById("inputDate");
    const sourceInput = document.getElementById("inputSource");
    const amountInput = document.getElementById("inputAmount");
    const methodInput = document.getElementById("inputMethod");

    // basic validation: date and amount are required
    if (!dateInput.value || !amountInput.value) {
        alert("Please select a date and enter an amount.");
        return;
    }

    // it creates a js object `newIncome`
    // amount is converted to number using parseFloat
    const newIncome = {
        date: dateInput.value,
        source: sourceInput.value,
        amount: parseFloat(amountInput.value),
        method: methodInput.value
    };

    // push new income into incomes array
    incomes.push(newIncome);

    // save updated incomes array to localStorage
    localStorage.setItem('incomes', JSON.stringify(incomes));

    // re-render income table with updated data
    renderIncomeTable();

    // clear input fields after saving
    dateInput.value = "";
    amountInput.value = "";
}


// this function applies filters (source + date)
// and sends filtered data to renderIncomeTable
function applyIncomeFilters() {

    // get filter values from DOM
    const source = document.getElementById('filterSource').value;
    const dateRange = document.getElementById('filterDateRange').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // filter incomes array based on source and date
    const filtered = incomes.filter(inc => {

        // source filter:
        // allows "All", "All Sources", or exact match
        const matchSource =
            (source === 'All' ||
             source === 'All Sources' ||
             source === inc.source);

        // date filter using helper function
        const matchDate =
            isDateInRange(inc.date, dateRange, startDate, endDate);

        return matchSource && matchDate;
    });

    // render only filtered incomes
    renderIncomeTable(filtered);
}


// this function renders income history table
// if no data is passed, it uses full incomes array
function renderIncomeTable(data = incomes) {

    // get table body and total display elements
    const historyBody = document.getElementById('historyBody');
    const totalDisplay = document.getElementById('totalAmountDisplay');

    // safety check: stop if table body doesn't exist
    if (!historyBody) return;

    // clear previous table rows
    historyBody.innerHTML = "";

    // reverse list so latest income shows first
    const listToRender = data.slice().reverse();

    // if no income records exist
    if (listToRender.length === 0) {
        historyBody.innerHTML =
            "<tr><td colspan='4'>No transactions found</td></tr>";
    } else {

        // loop through incomes and create table rows
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

    // calculate and display current month's total income
    if (totalDisplay) {

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let currentMonthTotal = 0;

        incomes.forEach(inc => {
            const d = new Date(inc.date);

            // only include incomes from current month
            if (d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear) {
                currentMonthTotal += Number(inc.amount);
            }
        });

        totalDisplay.innerText = "PKR " + currentMonthTotal;
    }
}


// 7. DASHBOARD LOGIC

// this function calculates dashboard stats
// for current month vs last month
// and updates recent income/expense lists
function updateDashboard() {

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // expense totals
    let expenseThisMonth = 0;
    let expenseLastMonth = 0;

    // loop through expenses
    expenses.forEach(exp => {

        const d = new Date(exp.date);
        const amt = Number(exp.amount);

        // current month expense
        if (d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear) {
            expenseThisMonth += amt;
        }

        // last month expense
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentMonth - 1);

        if (d.getMonth() === lastMonthDate.getMonth() &&
            d.getFullYear() === lastMonthDate.getFullYear()) {
            expenseLastMonth += amt;
        }
    });

    // income totals
    let incomeThisMonth = 0;
    let incomeLastMonth = 0;

    incomes.forEach(inc => {

        const d = new Date(inc.date);
        const amt = Number(inc.amount);

        // current month income
        if (d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear) {
            incomeThisMonth += amt;
        }

        // last month income
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentMonth - 1);

        if (d.getMonth() === lastMonthDate.getMonth() &&
            d.getFullYear() === lastMonthDate.getFullYear()) {
            incomeLastMonth += amt;
        }
    });

    // map values to dashboard element IDs
    const ids = {
        expThis: expenseThisMonth,
        expLast: expenseLastMonth,
        incThis: incomeThisMonth,
        incLast: incomeLastMonth
    };

    // update dashboard numbers
    for (let id in ids) {
        const el = document.getElementById(id);
        if (el) el.innerText = ids[id];
    }

    // render recent expenses list (last 3)
    const expenseList = document.getElementById("expenseList");
    if (expenseList) {

        expenseList.innerHTML = "";
        const recentExps = expenses.slice(-3).reverse();

        if (recentExps.length === 0) {
            expenseList.innerHTML = "<li>No expenses yet</li>";
        } else {
            recentExps.forEach(exp => {
                expenseList.innerHTML += `
                    <li>
                        <span><b>${exp.category} • ${exp.spentOn}</b></span>
                        <span class="amount red">PKR ${exp.amount}</span>
                    </li>`;
            });
        }
    }

    // render recent incomes list (last 3)
    const incomeList = document.getElementById("incomeList");
    if (incomeList) {

        incomeList.innerHTML = "";
        const recentIncs = incomes.slice(-3).reverse();

        if (recentIncs.length === 0) {
            incomeList.innerHTML =
                "<li><span>—</span><span class='amount green'>PKR 0</span></li>";
        } else {
            recentIncs.forEach(inc => {
                incomeList.innerHTML += `
                    <li>
                        <span><b>${inc.source}</b></span>
                        <span class="amount green">PKR ${inc.amount}</span>
                    </li>`;
            });
        }
    }
}


// 8. PROFILE PAGE LOGIC


// Initialize profile stats on page load if the profile view is active
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('totalBalance')) {
        updateProfile();
    }
});

// Calculate financial totals and update the profile UI using data from local storage
function updateProfile() {
    // Retrieve financial data from local storage or default to empty arrays
    const incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    // Aggregate income totals and filter for the current month
    incomes.forEach(inc => {
        const d = new Date(inc.date);
        const amt = Number(inc.amount);

        totalIncome += amt;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyIncome += amt;
        }
    });

    // Aggregate expense totals and filter for the current month
    expenses.forEach(exp => {
        const d = new Date(exp.date);
        const amt = Number(exp.amount);

        totalExpense += amt;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlyExpense += amt;
        }
    });

    // Derive net balance and monthly savings
    const totalBalance = totalIncome - totalExpense;
    const monthlySavings = monthlyIncome - monthlyExpense;

    // Helper to safely update DOM elements with formatted currency
    const setUI = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = "PKR " + value.toLocaleString();
    };

    // Update the UI with calculated values
    setUI("totalBalance", totalBalance);
    setUI("monthlyIncome", monthlyIncome);
    setUI("monthlyExpenses", monthlyExpense);
    setUI("savings", monthlySavings);
}


// 9. EDIT PROFILE LOGIC


// This event listener runs when the page loads
// It checks if the edit profile button exists
// If found, it loads existing profile data
// and attaches click event for editing profile
document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.getElementById('editProfile');
    if (editBtn) {
        loadProfileData();
        editBtn.addEventListener('click', handleProfileEdit);
    }
});

// This function loads user profile data from localStorage
// If no profile exists, it uses default values
// It then updates profile name, role, email, and image in the UI
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

// This function handles editing of profile information
// It prompts the user to update name, role, email, and image
// After validation, it saves updated data to localStorage
// and refreshes the profile UI
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