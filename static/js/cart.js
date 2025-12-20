document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.getAttribute('data-item-id');
            const quantity = this.value;
            updateCartItem(itemId, quantity);
        });
    });
    
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            removeCartItem(itemId);
        });
    });
    
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.history.back();
        });
    }
}

function updateCartItem(itemId, quantity) {
    fetch('/cart/update/' + itemId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'quantity=' + quantity
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartTotals();
            showNotification('Cart updated successfully', 'success');
        } else {
            showNotification('Error updating cart', 'error');
        }
    });
}

function removeCartItem(itemId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        fetch('/cart/remove/' + itemId, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`).closest('.cart-item');
                itemElement.remove();
                
                updateCartTotals();
                
                showNotification('Item removed from cart', 'success');
                
                if (document.querySelectorAll('.cart-item').length === 0) {
                    showEmptyCartMessage();
                }
            }
        });
    }
}

function updateCartTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('.cart-item').forEach(item => {
        const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', ''));
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        const total = price * quantity;
        
        item.querySelector('.item-total').textContent = '$' + total.toFixed(2);
        subtotal += total;
    });
    
    const tax = subtotal * 0.1; 
    const grandTotal = subtotal + tax;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('grand-total').textContent = '$' + grandTotal.toFixed(2);
}

function showEmptyCartMessage() {
    const cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = `
        <div class="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Browse our <a href="/products">products</a> to add items to your cart.</p>
        </div>
    `;
    
    document.querySelector('.cart-summary').style.display = 'none';
}