document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            window.location.href = updateUrlParameter('sort', this.value);
        });
    }
    
    // Filter functionality
    const categoryFilters = document.querySelectorAll('.category-filters a');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
        });
    });
    
    // Add to cart functionality for products page
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            addToCart(productId, 1);
        });
    });
    
    // Search form enhancement
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="search"]');
        searchInput.addEventListener('input', function() {
            // Real-time search suggestions could be implemented here
        });
    }
}

// Price filter functionality
function filterByPrice(minPrice, maxPrice) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const priceElement = product.querySelector('.sale-price, .price');
        const priceText = priceElement.textContent.replace('$', '');
        const price = parseFloat(priceText);
        
        if (price >= minPrice && price <= maxPrice) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Product quick view functionality
function showQuickView(productId) {
    fetch(`/products/${productId}/quickview`)
        .then(response => response.json())
        .then(product => {
            showProductModal(product);
        });
}

function showProductModal(product) {
    // Create and show modal with product details
    const modalHtml = `
        <div class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">$${product.price}</div>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.querySelector('.modal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}