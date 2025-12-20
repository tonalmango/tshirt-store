document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeCart();
    initializeSearch();
    initializeProductInteractions();
    initializeFlashMessages();
    initializeForms();
    initializeQuantityControls();
}

// Cart functionality
function initializeCart() {
    updateCartCount();
    
    // Handle add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');
            if (form) {
                const formData = new FormData(form);
                const productId = form.action.split('/').pop();
                addToCart(productId, formData.get('quantity') || 1);
            }
        });
    });
    
    // Handle add to cart forms
    document.querySelectorAll('.add-to-cart-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const productId = this.action.split('/').pop();
            const formData = new FormData(this);
            addToCart(productId, formData.get('quantity') || 1);
        });
    });
}

function addToCart(productId, quantity) {
    const formData = new FormData();
    formData.append('quantity', quantity);
    
    fetch(`/cart/add/${productId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message || 'Added to cart successfully!', 'success');
            updateCartCount(data.cart_count);
        } else {
            showNotification(data.message || 'Error adding to cart', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding to cart', 'error');
    });
}

function updateCartCount(count = null) {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        if (count !== null) {
            cartCountElement.textContent = count;
        } else {
            fetch('/cart/count')
            .then(response => response.json())
            .then(data => {
                cartCountElement.textContent = data.count;
            });
        }
    }
}

// Search functionality
function initializeSearch() {
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const searchInput = this.querySelector('input[name="search"]');
            if (!searchInput.value.trim()) {
                e.preventDefault();
            }
        });
    }
}

// Product interactions
function initializeProductInteractions() {
    const productImages = document.querySelectorAll('.product-image img');
    productImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Flash messages auto-hide
function initializeFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash');
    flashMessages.forEach(flash => {
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s';
            setTimeout(() => flash.remove(), 500);
        }, 5000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `flash ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    
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

// URL parameter utilities
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateUrlParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    return url.toString();
}

// Form validation
function initializeForms() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Quantity controls
function initializeQuantityControls() {
    // Plus button handlers
    document.querySelectorAll('.quantity-plus').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            const max = parseInt(input.getAttribute('max')) || 99;
            let value = parseInt(input.value) || 1;
            if (value < max) {
                input.value = value + 1;
                updateCartItemQuantity(input);
            }
        });
    });
    
    // Minus button handlers
    document.querySelectorAll('.quantity-minus').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            const min = parseInt(input.getAttribute('min')) || 1;
            let value = parseInt(input.value) || 1;
            if (value > min) {
                input.value = value - 1;
                updateCartItemQuantity(input);
            }
        });
    });
    
    // Input change handlers
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            updateCartItemQuantity(this);
        });
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-decrease')) {
            const input = e.target.nextElementSibling;
            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
                updateCartItemQuantity(input);
            }
        }
        
        if (e.target.classList.contains('quantity-increase')) {
            const input = e.target.previousElementSibling;
            input.value = parseInt(input.value) + 1;
            updateCartItemQuantity(input);
        }
    });
}

function updateCartItemQuantity(input) {
    const itemId = input.getAttribute('data-item-id');
    const quantity = parseInt(input.value);
    
    if (itemId && quantity > 0) {
        fetch(`/cart/update/${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: quantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCount(data.cart_count);
                if (data.item_total) {
                    const totalElement = input.closest('.cart-item')?.querySelector('.item-total');
                    if (totalElement) {
                        totalElement.textContent = `$${data.item_total.toFixed(2)}`;
                    }
                }
                if (data.cart_total) {
                    const cartTotalElement = document.querySelector('.cart-total');
                    if (cartTotalElement) {
                        cartTotalElement.textContent = `$${data.cart_total.toFixed(2)}`;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error updating cart:', error);
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Image lazy loading
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Initialize tooltips (if needed)
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Export functions for use in other scripts
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.showNotification = showNotification;