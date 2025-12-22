from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    from app.routes import main, auth, products, cart, orders, admin
    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(products)
    app.register_blueprint(cart)
    app.register_blueprint(orders)
    app.register_blueprint(admin)
    
    with app.app_context():
        db.create_all()
        
        # Auto-seed database if empty
        from app.models import Product, Category, User
        if Product.query.count() == 0:
            try:
                # Create admin
                admin = User(username='admin', email='admin@tshirtstore.com', first_name='Admin', last_name='User', is_admin=True)
                admin.set_password('admin123')
                db.session.add(admin)
                
                # Create categories
                cats = [
                    Category(name='Men', description='Men\'s T-Shirts'),
                    Category(name='Women', description='Women\'s T-Shirts'),
                    Category(name='Kids', description='Kids T-Shirts'),
                    Category(name='Unisex', description='Unisex T-Shirts')
                ]
                for c in cats: 
                    db.session.add(c)
                db.session.commit()
                
                # Create products
                prods = [
                    Product(name='Classic White Tee', description='Premium cotton', price=19.99, stock_quantity=50, category_id=1, is_active=True, image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
                    Product(name='Blue Graphic Tee', description='Cool design', price=24.99, discounted_price=19.99, stock_quantity=30, category_id=1, is_active=True, image_url='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'),
                    Product(name='Pink V-Neck', description='Soft pink', price=22.99, stock_quantity=40, category_id=2, is_active=True, image_url='https://images.unsplash.com/photo-1495777871333-b6c58266bf8c?w=500'),
                    Product(name='Kids Superhero Tee', description='Fun design', price=15.99, stock_quantity=25, category_id=3, is_active=True, image_url='https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=500'),
                    Product(name='Black Essential Tee', description='Basic black', price=18.99, stock_quantity=100, category_id=4, is_active=True, image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
                ]
                for p in prods:
                    db.session.add(p)
                db.session.commit()
                
                print("✅ Database auto-seeded with sample data!")
            except Exception as e:
                print(f"⚠️ Auto-seed skipped: {e}")
    
    return app