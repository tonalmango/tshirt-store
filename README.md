# 🎨 T-Shirt Store - E-Commerce Application

A complete, production-ready e-commerce platform built with Flask. Featuring a modern UI, comprehensive admin panel, and full shopping cart functionality.

## ✨ Features

### 👥 Customer Features
- **User Authentication** - Register, login, logout with secure password hashing
- **Product Browsing** - Browse all products with detailed product pages
- **Advanced Search** - Search products with category filters and price range slider
- **Shopping Cart** - Add/remove items, update quantities with real-time totals
- **Checkout** - Multi-step checkout with address and payment information
- **Order Management** - View order history with detailed order tracking
- **Order Timeline** - Visual timeline showing order status progression
- **Product Reviews** - Leave and view customer reviews with ratings
- **Responsive Design** - Fully mobile-responsive interface

### 🛠️ Admin Features
- **Dashboard** - Overview with sales statistics and charts
- **Product Management** - Add, edit, delete products with image uploads
- **Order Management** - View all orders, update status, print invoices
- **User Management** - View users, manage admin roles, delete accounts
- **Stock Tracking** - Low stock alerts and inventory management
- **Sales Analytics** - Interactive charts and sales data visualization
- **Admin Panel** - Professional sidebar-based admin interface

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Clone or Download the Project**
```bash
cd tshirt_store
```

2. **Create Virtual Environment**
```bash
python -m venv venv
```

3. **Activate Virtual Environment**

**Windows (PowerShell):**
```bash
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```bash
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

4. **Install Dependencies**
```bash
pip install -r requirements.txt
```

5. **Run the Application**
```bash
python run.py
```

6. **Access the App**
Open your browser and go to:
```
http://127.0.0.1:5000
```

## 🧪 Testing the Application

### Create Sample Data

1. **Open Python shell:**
```bash
python
```

2. **Create admin user:**
```python
from app import app, db
from app.models import User, Category, Product

with app.app_context():
    # Create admin user
    admin = User(
        username='admin',
        email='admin@example.com',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    
    # Create categories
    categories = [
        Category(name='Men', description='Men\'s T-Shirts'),
        Category(name='Women', description='Women\'s T-Shirts'),
        Category(name='Kids', description='Kids T-Shirts'),
    ]
    for cat in categories:
        db.session.add(cat)
    
    # Create sample products
    products = [
        Product(name='Classic White Tee', description='Premium cotton white t-shirt',
                price=19.99, stock_quantity=50, category_id=1, is_active=True),
        Product(name='Blue Graphic Tee', description='Cool blue t-shirt with graphic',
                price=24.99, discounted_price=19.99, stock_quantity=30, category_id=1, is_active=True),
        Product(name='Pink V-Neck', description='Soft pink v-neck t-shirt',
                price=22.99, stock_quantity=40, category_id=2, is_active=True),
    ]
    for product in products:
        db.session.add(product)
    
    db.session.commit()
    print("Sample data created!")
```

### Customer Testing
- Register at `/register`
- Login at `/login`
- Browse products at `/products`
- Add to cart and checkout at `/cart/checkout`
- View orders at `/orders`

### Admin Testing
- Login as admin (admin@example.com / admin123)
- Access admin panel at `/admin/dashboard`
- Manage products, orders, and users

## 📁 Project Structure

```
tshirt_store/
├── app/                          # Flask application package
│   ├── __init__.py               # App initialization and configuration
│   ├── models.py                 # Database models (User, Product, Order, etc.)
│   ├── forms.py                  # WTForms form definitions
│   ├── routes.py                 # Application routes and views
│   ├── utils.py                  # Utility functions and decorators
│   └── templates/                # HTML templates
│       ├── base.html             # Base template with navigation
│       ├── index.html            # Homepage
│       ├── auth/                 # Authentication templates
│       │   ├── login.html
│       │   └── register.html
│       ├── products/             # Product templates
│       │   ├── list.html
│       │   ├── detail.html
│       │   └── search.html
│       ├── cart/                 # Cart templates
│       │   ├── view.html
│       │   └── checkout.html
│       ├── orders/               # Order templates
│       │   ├── history.html
│       │   └── detail.html
│       └── admin/                # Admin templates
│           ├── dashboard.html
│           ├── product.html
│           ├── orders.html
│           └── users.html
├── static/                       # Static files
│   ├── css/
│   │   ├── style.css             # Main stylesheet
│   │   └── admin.css             # Admin panel styles
│   ├── js/
│   │   ├── main.js               # Main JavaScript
│   │   ├── admin.js              # Admin JavaScript
│   │   └── cart.js               # Cart functionality
│   └── images/                   # Images directory
├── tests/                        # Test files
├── migrations/                   # Database migrations
├── config.py                     # Configuration settings
├── database.py                   # Database initialization
├── run.py                        # Application entry point
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🛠️ Technology Stack

### Backend
- **Flask** 3.1.2 - Web framework
- **SQLAlchemy** 3.1.1 - ORM for database
- **Flask-Login** 0.6.3 - User authentication
- **Flask-Migrate** 4.1.0 - Database migrations
- **Flask-WTF** 1.2.2 - Forms with CSRF protection
- **Werkzeug** - Password hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with CSS variables
- **JavaScript (Vanilla)** - Interactivity
- **Chart.js** - Analytics charts

### Database
- **SQLite** - Development (can upgrade to PostgreSQL)

### Other Tools
- **Pillow** - Image processing
- **email-validator** - Email validation
- **psycopg2** - PostgreSQL adapter (optional)

## 📋 Models

### User
- Username, email, password (hashed)
- First/last name
- Admin flag
- Created timestamp

### Product
- Name, description, price
- Discounted price (optional)
- Stock quantity
- Category relationship
- Image URL
- Active status
- Rating and review counts

### Category
- Name and description
- Products relationship

### CartItem
- User relationship
- Product relationship
- Quantity

### Order
- User relationship
- Order number (auto-generated)
- Status (pending, confirmed, shipped, delivered)
- Total amount
- Shipping/billing addresses
- Payment method and status
- Order items relationship

### OrderItem
- Order relationship
- Product information
- Price and quantity

### Review
- User and product relationship
- Rating (1-5 stars)
- Comment
- Approval status

## 🔧 Configuration

Edit `config.py` to customize:

```python
SECRET_KEY = 'your-secret-key'           # Change for production
SQLALCHEMY_DATABASE_URI = 'sqlite:///...' # Database URL
DEBUG = True                              # Debug mode
UPLOAD_FOLDER = 'uploads/'                # Upload directory
PRODUCTS_PER_PAGE = 12                    # Pagination
```

## 🗄️ Database

### Initialize Database (First Time)
```bash
python
from app import app, db
with app.app_context():
    db.create_all()
print("Database created!")
```

### Using Flask-Migrate (Recommended)
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## 🚀 Deployment

### Render
1. Push code to GitHub
2. Connect Render to GitHub repo
3. Set environment variables
4. Deploy with `gunicorn`

### Heroku
```bash
git push heroku main
```

### PythonAnywhere
1. Upload files via web interface
2. Configure WSGI file
3. Reload app

### VPS (DigitalOcean, Linode, AWS)
1. Install Python, PostgreSQL, Nginx
2. Clone repository
3. Set up virtual environment
4. Configure Gunicorn + Nginx
5. Use Supervisor for process management

### Environment Variables
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost/dbname
DEBUG=False
```

## 📝 API Routes

### Public Routes
```
GET  /                           # Homepage
GET  /products                   # Product listing
GET  /product/<id>               # Product detail
GET  /register                   # Registration page
POST /register                   # Create account
GET  /login                      # Login page
POST /login                      # User login
GET  /logout                     # User logout
```

### Customer Routes (Login Required)
```
GET  /cart                       # View cart
POST /cart/add/<id>              # Add to cart
POST /cart/update/<id>           # Update quantity
GET  /cart/checkout              # Checkout page
POST /cart/checkout              # Place order
GET  /orders                     # Order history
GET  /orders/<id>                # Order detail
POST /product/<id>/review        # Add review
```

### Admin Routes (Admin Only)
```
GET  /admin/dashboard            # Admin dashboard
GET  /admin/products             # Product management
POST /admin/products/new         # Add product
GET  /admin/orders               # Order management
GET  /admin/users                # User management
```

## 🎨 Customization

### Change Colors
Edit CSS variables in `static/css/style.css`:
```css
:root {
    --primary: #3a86ff;      /* Main color */
    --secondary: #ff006e;    /* Secondary color */
    --success: #28a745;      /* Success color */
    /* ... more variables ... */
}
```

### Change Logo/Branding
Edit `app/templates/base.html` and update the brand text in the navbar.

### Add New Product Fields
1. Add column to Product model in `models.py`
2. Create migration
3. Update ProductForm in `forms.py`
4. Update templates to display field

## 🐛 Troubleshooting

### Import Errors
```bash
pip install -r requirements.txt
```

### Database Errors
```bash
rm instance/config.py
rm tshirt_store.db
python
from app import app, db
with app.app_context():
    db.create_all()
```

### Static Files Not Loading
- Verify `static/` folder exists at project root
- Check file paths in templates
- Clear browser cache

### Port Already in Use
```bash
python run.py --port 5001
```

## 📚 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [WTForms Documentation](https://wtforms.readthedocs.io/)
- [Jinja2 Templates](https://jinja.palletsprojects.com/)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Review documentation files
3. Open a new issue with details

---

## ✅ Checklist for Production

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set `DEBUG = False`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure HTTPS/SSL
- [ ] Set up email notifications
- [ ] Configure backup strategy
- [ ] Set up error logging
- [ ] Test all features thoroughly
- [ ] Create admin account
- [ ] Add product categories and items
- [ ] Test payment system
- [ ] Set up monitoring and alerts

---

**Happy Selling! 🎉**

Your T-shirt store is ready to go live!
