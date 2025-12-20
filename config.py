import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-1234569'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///tshirt_store.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = 'static/uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    PRODUCTS_PER_PAGE = 12
    
    ADMIN_USERS = ['admin@tshirtstore.com']