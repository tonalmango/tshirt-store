from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, abort
from flask_login import login_user, logout_user, current_user, login_required
from sqlalchemy import or_, desc
from app import db
from app.models import User, Product, Category, CartItem, Order, OrderItem, Review
from app.forms import RegistrationForm, LoginForm, ProductForm, ReviewForm, CheckoutForm
from app.utils import save_image, admin_required
import os

# Create blueprints
main = Blueprint('main', __name__)
auth = Blueprint('auth', __name__)
products = Blueprint('products', __name__)
cart = Blueprint('cart', __name__)
orders = Blueprint('orders', __name__)
admin = Blueprint('admin', __name__)

@main.route('/')
def index():
    featured_products = Product.query.filter_by(is_active=True).order_by(desc(Product.created_at)).limit(8).all()
    
    sale_products = Product.query.filter(Product.discounted_price.isnot(None), Product.is_active==True).limit(8).all()
    
    categories = Category.query.all()
    
    return render_template('index.html', 
                         featured_products=featured_products,
                         sale_products=sale_products,
                         categories=categories)

@main.route('/products')
def products_list():
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'newest')
    
    query = Product.query.filter_by(is_active=True)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if search:
        query = query.filter(or_(
            Product.name.ilike(f'%{search}%'),
            Product.description.ilike(f'%{search}%')
        ))
    
    if sort == 'price_low':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_high':
        query = query.order_by(Product.price.desc())
    elif sort == 'name':
        query = query.order_by(Product.name.asc())
    else:  
        query = query.order_by(desc(Product.created_at))
    
    products = query.paginate(page=page, per_page=12, error_out=False)
    categories = Category.query.all()
    
    return render_template('products/list.html', 
                         products=products,
                         categories=categories,
                         current_category=category_id,
                         search=search,
                         sort=sort)

@main.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    
    if not product.is_active and not current_user.is_admin:
        abort(404)
    
    related_products = Product.query.filter_by(
        category_id=product.category_id
    ).filter(
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()
    
    reviews = Review.query.filter_by(
        product_id=product_id,
        is_approved=True
    ).order_by(desc(Review.created_at)).all()
    
    avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(
        product_id=product_id,
        is_approved=True
    ).scalar() or 0
    
    form = ReviewForm()
    
    return render_template('products/detail.html',
                         product=product,
                         related_products=related_products,
                         reviews=reviews,
                         avg_rating=round(avg_rating, 1),
                         form=form) 

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            first_name=form.first_name.data,
            last_name=form.last_name.data
        )
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', form=form)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            flash('Login successful!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('main.index'))
        else:
            flash('Login failed. Check email and password.', 'danger')
    
    return render_template('auth/login.html', form=form)

@auth.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

@cart.route('/cart')
@login_required
def view_cart():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    total = sum(item.total_price for item in cart_items)
    
    return render_template('cart/view.html', cart_items=cart_items, total=total)

@cart.route('/cart/add/<int:product_id>', methods=['POST'])
@login_required
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    quantity = request.form.get('quantity', 1, type=int)
    
    if quantity < 1:
        return jsonify({'success': False, 'message': 'Invalid quantity'})
    
    if quantity > product.stock_quantity:
        return jsonify({'success': False, 'message': 'Not enough stock available'})
    
    cart_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Product added to cart!',
        'cart_count': current_user.cart_items.count()
    })

@cart.route('/cart/update/<int:item_id>', methods=['POST'])
@login_required
def update_cart(item_id):
    cart_item = CartItem.query.get_or_404(item_id)
    
    if cart_item.user_id != current_user.id:
        abort(403)
    
    quantity = request.form.get('quantity', 1, type=int)
    
    if quantity < 1:
        db.session.delete(cart_item)
    else:
        if quantity > cart_item.product.stock_quantity:
            return jsonify({'success': False, 'message': 'Not enough stock available'})
        cart_item.quantity = quantity
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Cart updated'})

@cart.route('/cart/remove/<int:item_id>', methods=['POST'])
@login_required
def remove_from_cart(item_id):
    cart_item = CartItem.query.get_or_404(item_id)
    
    if cart_item.user_id != current_user.id:
        abort(403)
    
    db.session.delete(cart_item)
    db.session.commit()
    
    flash('Item removed from cart', 'success')
    return redirect(url_for('cart.view_cart'))

@orders.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    
    if not cart_items:
        flash('Your cart is empty', 'warning')
        return redirect(url_for('cart.view_cart'))
    
    for item in cart_items:
        if item.quantity > item.product.stock_quantity:
            flash(f'Not enough stock for {item.product.name}', 'danger')
            return redirect(url_for('cart.view_cart'))
    
    form = CheckoutForm()
    
    if form.validate_on_submit():
        order = Order(user_id=current_user.id)
        order.generate_order_number()
        order.shipping_address = form.shipping_address.data
        order.billing_address = form.billing_address.data
        order.payment_method = form.payment_method.data
        
        db.session.add(order)
        db.session.flush()
        
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.final_price
            )
            db.session.add(order_item)
            
            cart_item.product.stock_quantity -= cart_item.quantity
        
        order.calculate_total()
        
        CartItem.query.filter_by(user_id=current_user.id).delete()
        
        db.session.commit()
        
        flash('Order placed successfully!', 'success')
        return redirect(url_for('orders.order_detail', order_id=order.id))
    
    total = sum(item.total_price for item in cart_items)
    
    return render_template('cart/checkout.html', form=form, cart_items=cart_items, total=total)

@orders.route('/orders')
@login_required
def order_history():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(desc(Order.created_at)).all()
    return render_template('orders/history.html', orders=orders)

@orders.route('/orders/<int:order_id>')
@login_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    
    return render_template('orders/detail.html', order=order)

@admin.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_users = User.query.count()
    recent_orders = Order.query.order_by(desc(Order.created_at)).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         total_products=total_products,
                         total_orders=total_orders,
                         total_users=total_users,
                         recent_orders=recent_orders)

@admin.route('/admin/products')
@login_required
@admin_required
def admin_products():
    page = request.args.get('page', 1, type=int)
    products = Product.query.order_by(desc(Product.created_at)).paginate(page=page, per_page=10)
    categories = Category.query.all()
    form = ProductForm()
    
    form.category_id.choices = [(c.id, c.name) for c in categories]
    
    return render_template('admin/products.html', products=products, form=form)

@admin.route('/admin/products/new', methods=['POST'])
@login_required
@admin_required
def admin_add_product():
    form = ProductForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    if form.validate_on_submit():
        product = Product(
            name=form.name.data,
            description=form.description.data,
            price=form.price.data,
            discounted_price=form.discounted_price.data,
            stock_quantity=form.stock_quantity.data,
            category_id=form.category_id.data,
            is_active=form.is_active.data
        )
        
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename:
                filename = save_image(image_file)
                product.image_url = filename
        
        db.session.add(product)
        db.session.commit()
        
        flash('Product added successfully!', 'success')
    
    return redirect(url_for('admin.admin_products'))

@admin.route('/admin/orders')
@login_required
@admin_required
def admin_orders():
    page = request.args.get('page', 1, type=int)
    orders = Order.query.order_by(desc(Order.created_at)).paginate(page=page, per_page=20)
    
    pending_count = Order.query.filter_by(status='pending').count()
    processing_count = Order.query.filter_by(status='confirmed').count()
    
    return render_template('admin/orders.html', 
                         orders=orders, 
                         pending_count=pending_count,
                         processing_count=processing_count)

@admin.route('/admin/users')
@login_required
@admin_required
def admin_users():
    page = request.args.get('page', 1, type=int)
    users = User.query.order_by(desc(User.created_at)).paginate(page=page, per_page=12)
    
    return render_template('admin/users.html', users=users)

@products.route('/product/<int:product_id>/review', methods=['POST'])
@login_required
def add_review(product_id):
    product = Product.query.get_or_404(product_id)
    form = ReviewForm()
    
    if form.validate_on_submit():
        existing_review = Review.query.filter_by(
            user_id=current_user.id,
            product_id=product_id
        ).first()
        
        if existing_review:
            flash('You have already reviewed this product', 'warning')
            return redirect(url_for('main.product_detail', product_id=product_id))
        
        review = Review(
            user_id=current_user.id,
            product_id=product_id,
            rating=form.rating.data,
            comment=form.comment.data,
            is_approved=True
        )
        
        db.session.add(review)
        db.session.commit()
        
        flash('Review added successfully!', 'success')
    
    return redirect(url_for('main.product_detail', product_id=product_id))