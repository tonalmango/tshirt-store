// Admin Panel JavaScript Functions

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    initializeModals();
    initializeTableSorting();
    initializeConfirmations();
    initializeDataPickers();
}

// ===== Modal Management =====
function initializeModals() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
    
    // Close button functionality
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
}

// ===== Table Sorting =====
function initializeTableSorting() {
    const headers = document.querySelectorAll('table th');
    headers.forEach((header, index) => {
        if (!header.textContent.includes('Action')) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                sortTable(index);
            });
        }
    });
}

function sortTable(columnIndex) {
    const table = document.querySelector('table tbody');
    if (!table) return;
    
    const rows = Array.from(table.querySelectorAll('tr'));
    const isAscending = table.dataset.sortAscending === 'true';
    
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        // Try to parse as number
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? bNum - aNum : aNum - bNum;
        }
        
        // String comparison
        return isAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });
    
    rows.forEach(row => table.appendChild(row));
    table.dataset.sortAscending = !isAscending;
}

// ===== Confirmation Dialogs =====
function initializeConfirmations() {
    document.querySelectorAll('[onclick*="delete"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Are you sure? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
}

// ===== Date/Time Pickers =====
function initializeDataPickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Date selected:', this.value);
        });
    });
}

// ===== Export Functions =====
function exportTableToCSV(filename = 'export.csv') {
    const table = document.querySelector('table');
    if (!table) {
        alert('No table found to export');
        return;
    }
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.textContent.trim() + '"');
        });
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    downloadCSV(csvContent, filename);
}

function downloadCSV(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ===== Form Utilities =====
function validateAdminForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    }
}

// ===== Data Management =====
function deleteItem(itemId, itemType) {
    if (!confirm(`Delete this ${itemType}?`)) {
        return;
    }
    
    fetch(`/admin/${itemType}s/${itemId}/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`${itemType} deleted successfully!`);
            location.reload();
        } else {
            alert('Error deleting ' + itemType);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}

function updateItemStatus(itemId, status, itemType) {
    fetch(`/admin/${itemType}s/${itemId}/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAdminNotification(`${itemType} status updated!`, 'success');
            // Reload or update UI
        } else {
            showAdminNotification('Error updating status', 'error');
        }
    });
}

// ===== Notifications =====
function showAdminNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    // Color based on type
    const colors = {
        success: '#d4edda',
        error: '#f8d7da',
        info: '#d1ecf1',
        warning: '#fff3cd'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

// ===== Bulk Actions =====
function selectAllCheckboxes(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    updateBulkActionButtons();
}

function updateBulkActionButtons() {
    const checkedCount = document.querySelectorAll('.item-checkbox:checked').length;
    const bulkButtons = document.querySelectorAll('.bulk-action-btn');
    
    bulkButtons.forEach(btn => {
        btn.disabled = checkedCount === 0;
    });
}

function bulkDelete() {
    const checkedItems = document.querySelectorAll('.item-checkbox:checked');
    if (checkedItems.length === 0) {
        alert('Select items to delete');
        return;
    }
    
    if (!confirm(`Delete ${checkedItems.length} items?`)) {
        return;
    }
    
    const ids = Array.from(checkedItems).map(checkbox => checkbox.value);
    
    fetch('/admin/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: ids })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAdminNotification('Items deleted successfully!', 'success');
            location.reload();
        }
    });
}

// ===== Search and Filter =====
function liveSearch(inputId, targetSelector) {
    const searchInput = document.getElementById(inputId);
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = document.querySelectorAll(targetSelector);
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// ===== Statistics =====
function refreshStatistics() {
    fetch('/admin/api/statistics')
        .then(response => response.json())
        .then(data => {
            updateStatisticCards(data);
        });
}

function updateStatisticCards(data) {
    const cards = {
        revenue: document.querySelector('[data-stat="revenue"]'),
        orders: document.querySelector('[data-stat="orders"]'),
        products: document.querySelector('[data-stat="products"]'),
        users: document.querySelector('[data-stat="users"]')
    };
    
    if (cards.revenue) cards.revenue.textContent = '$' + data.revenue.toFixed(2);
    if (cards.orders) cards.orders.textContent = data.orders;
    if (cards.products) cards.products.textContent = data.products;
    if (cards.users) cards.users.textContent = data.users;
}

// ===== Image Preview =====
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', function() {
        const file = this.files[0];
        const reader = new FileReader();
        
        reader.addEventListener('load', function() {
            preview.src = reader.result;
            preview.style.display = 'block';
        });
        
        if (file) {
            reader.readAsDataURL(file);
        }
    });
}

// Export functions for global use
window.deleteItem = deleteItem;
window.updateItemStatus = updateItemStatus;
window.showAdminNotification = showAdminNotification;
window.bulkDelete = bulkDelete;
window.selectAllCheckboxes = selectAllCheckboxes;
window.exportTableToCSV = exportTableToCSV;
