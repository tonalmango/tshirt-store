import os
from PIL import Image
from flask import current_app, flash, redirect, url_for
from functools import wraps
from flask_login import current_user

def save_image(image_file):
    """Save uploaded image and return filename"""
    if image_file:
        upload_path = os.path.join(current_app.root_path, 'static/uploads')
        os.makedirs(upload_path, exist_ok=True)
        
        import uuid
        ext = image_file.filename.split('.')[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_path, filename)
        
        img = Image.open(image_file)
        img.thumbnail((800, 800))
        img.save(filepath)
        
        return f"uploads/{filename}"
    return None

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Admin access required', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

def format_currency(amount):
    return f"${amount:,.2f}"