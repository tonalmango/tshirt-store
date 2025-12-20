"""
Database seeding script for T-shirt Store.
Automatically populates the database with sample data on deployment.
"""

from app import create_app, db
from app.models import User, Category, Product


def seed_db():
    """Seed the database with sample data if it's empty."""
    app = create_app()
    
    with app.app_context():
        # Skip if products already exist
        if Product.query.count() > 0:
            print("✅ Database already seeded. Skipping...")
            return
        
        try:
            # Create admin user
            admin = User(
                username='admin',
                email='admin@tshirtstore.com',
                first_name='Admin',
                last_name='User',
                is_admin=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created!")
            
            # Create categories
            categories = [
                Category(name='Men', description='Men\'s T-Shirts'),
                Category(name='Women', description='Women\'s T-Shirts'),
                Category(name='Kids', description='Kids T-Shirts'),
                Category(name='Unisex', description='Unisex T-Shirts')
            ]
            for cat in categories:
                db.session.add(cat)
            db.session.commit()
            print("✅ Categories created!")
            
            # Create sample products with placeholder images
            products = [
                Product(
                    name='Classic White Tee',
                    description='Premium cotton white t-shirt. Perfect for everyday wear.',
                    price=19.99,
                    stock_quantity=50,
                    category_id=1,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Blue Graphic Tee',
                    description='Cool blue t-shirt with trendy graphic design.',
                    price=24.99,
                    discounted_price=19.99,
                    stock_quantity=30,
                    category_id=1,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Pink V-Neck',
                    description='Soft pink v-neck t-shirt for women. Comfortable and stylish.',
                    price=22.99,
                    stock_quantity=40,
                    category_id=2,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1495777871333-b6c58266bf8c?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Kids Superhero Tee',
                    description='Fun superhero design for kids. Their favorite characters!',
                    price=15.99,
                    stock_quantity=25,
                    category_id=3,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Black Essential Tee',
                    description='Basic black t-shirt. A wardrobe essential for everyone.',
                    price=18.99,
                    stock_quantity=100,
                    category_id=4,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Red Vintage Tee',
                    description='Retro red t-shirt with vintage vibes. Timeless style.',
                    price=21.99,
                    stock_quantity=35,
                    category_id=2,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1456821188899-4af8b5e87db9?w=500&h=500&fit=crop'
                ),
                Product(
                    name='Green Eco Tee',
                    description='Sustainable eco-friendly green t-shirt. Save the planet!',
                    price=23.99,
                    stock_quantity=20,
                    category_id=1,
                    is_active=True,
                    image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
                ),
            ]
            for product in products:
                db.session.add(product)
            db.session.commit()
            print(f"✅ {len(products)} products created with placeholder images!")
            
            print("\n🎉 Database seeding complete!")
            print("Admin Login: admin@tshirtstore.com / admin123")
            
        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            db.session.rollback()


if __name__ == '__main__':
    seed_db()
