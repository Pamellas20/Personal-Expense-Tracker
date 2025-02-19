// Data management
let expenses = [];
let currentEditId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeEventListeners();
    setMaxDate();
    renderExpenses();
});

// Initialize event listeners
function initializeEventListeners() {
    document.getElementById('expenseForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Event delegation for edit/delete buttons
    document.getElementById('expensesList').addEventListener('click', function (e) {
        const target = e.target;
        const row = target.closest('tr');

        if (!row) return;

        const id = parseInt(row.dataset.id);

        if (target.classList.contains('edit-btn')) {
            editExpense(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteExpense(id);
        }
    });

    // Handle update button
    document.getElementById('updateBtn').addEventListener('click', function () {
        document.getElementById('expenseForm').dispatchEvent(new Event('submit'));
    });
}

// Set max date to today for date inputs
function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').max = today;
    document.getElementById('endDate').max = today;
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (currentEditId === null) {
        // Add new expense
        const newExpense = {
            id: Date.now(),
            description,
            amount,
            category,
            date
        };
        expenses.push(newExpense);
    } else {
        // Update existing expense
        const index = expenses.findIndex(exp => exp.id === currentEditId);
        if (index !== -1) {
            expenses[index] = {
                ...expenses[index],
                description,
                amount,
                category,
                date
            };
        }
        currentEditId = null;
        document.getElementById('submitBtn').style.display = 'block';
        document.getElementById('updateBtn').style.display = 'none';
    }

    saveToLocalStorage();
    renderExpenses();
    e.target.reset();
}

// Render expenses to table
function renderExpenses() {
    const tbody = document.getElementById('expensesList');
    tbody.innerHTML = '';

    const filteredExpenses = getFilteredExpenses();

    filteredExpenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.className = `expense-item category-${expense.category}`;
        tr.dataset.id = expense.id; // Store ID as data attribute

        tr.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td class="action-buttons">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;

        currentEditId = id;
        document.getElementById('submitBtn').style.display = 'none';
        document.getElementById('updateBtn').style.display = 'block';
    }
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveToLocalStorage();
        renderExpenses();
    }
}

// Filter expenses
function getFilteredExpenses() {
    const category = document.getElementById('filterCategory').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    return expenses.filter(expense => {
        const categoryMatch = !category || expense.category === category;
        const dateMatch = (!startDate || expense.date >= startDate) &&
            (!endDate || expense.date <= endDate);
        return categoryMatch && dateMatch;
    });
}

// Apply filters
function applyFilters() {
    renderExpenses();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    renderExpenses();
}

// Local Storage functions
function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadFromLocalStorage() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}