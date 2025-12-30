# Finance Tracker (Spend Less, Save More)

A modern, responsive, and functional Finance Tracker application built as part of the **Introduction to Computer Science (CSCL1108)** course. This project demonstrates front-end web development skills, including complex logic for financial calculations, data filtering, and a glassmorphism UI design.

---

## Features

* **Dashboard Overview:** View real-time summaries of "Income vs. Expenses" for the current and previous months.
* **Transaction Management:** Add new income sources and daily expenses with categories (e.g., Food, Transport, Salary).
* **Smart Filtering:** Filter transaction history by date ranges (Last Month, Last 3 Months, Custom Range) and specific categories.
* **Persistent Data:** Uses `localStorage` so your financial data remains saved even after refreshing the page or closing the browser.
* **Profile Management:** View and edit user details (Name, Role, Email) with changes saved instantly.
* **Glassmorphism UI:** A modern, translucent interface design using CSS backdrop-filters.

## Tech Stack

* **HTML5:** For the semantic structure of the dashboard and forms.
* **CSS3:** Advanced styling using CSS Variables, Flexbox, Grid, and Glassmorphism effects.
* **JavaScript (ES6+):** For application logic, date calculations, DOM manipulation, and data storage.
* **GitHub Pages:** For hosting and live deployment.

## Folder Structure

```text
├── index.html          # Login Page (Entry point)
├── dashboard.html      # Main Dashboard (Summary & Recent Activity)
├── income.html         # Income Management Page
├── expenses.html       # Expense Management Page
├── profile.html        # User Profile Settings
├── logout.html         # Logout Confirmation
├── style.css           # Global Styles & Glassmorphism Theme
├── script.js           # Core Logic (Calculations, Storage, Filtering)
└── assets/             # Images and Icons (logo.png, avatar.png)

```

## ⚙️ How to Run Locally

### **Local Setup**

1. **Clone the repository:**
```bash
git clone https://github.com/umaisnasir/University-Semester1-End-PJTs.git

```


2. **Navigate to the project folder:**
*(Note: Navigate to the specific subfolder where the files are located)*
```bash
cd "University-Semester1-End-PJTs/CSCL1108 Lab.../FrontEnd - Finance Tracker"

```


3. **Launch:**
Simply open `index.html` in your web browser.

## Key Concepts Applied

* **DOM Manipulation:** Dynamically rendering tables for "Recent Expenses" and "Transaction History".
* **Local Storage API:** Using `JSON.parse()` and `JSON.stringify()` to persist user data (Incomes, Expenses, User Profile).
* **Array Iteration:** Using `filter()`, `reverse()`, and `forEach()` to calculate totals and sort data.
* **Date Handling:** Custom logic to compare dates for "Last Month" or "Custom Range" filtering.
* **CSS Variables:** Managing theme colors (`--blue`, `--green`, `--glass`) centrally.

## Authors

- [@umaisnasir](https://github.com/umaisnasir)
- [@sidramujtaba](https://github.com/sidramujtaba)
- [@tresAFK-dev](https://github.com/tresAFK-dev)
- [@Hammadahmed00700](https://github.com/Hammadahmed00700)

---

*© 2025 All rights reserved.*
