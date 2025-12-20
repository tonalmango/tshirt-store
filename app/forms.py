from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, DecimalField, IntegerField, SelectField, BooleanField
from wtforms.validators import DataRequired, Email, Length, EqualTo, NumberRange, ValidationError
from app.models import User

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=2, max=64)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(min=2, max=64)])
    
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already exists. Please choose a different one.')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use a different one.')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')

class ProductForm(FlaskForm):
    name = StringField('Product Name', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description')
    price = DecimalField('Price', validators=[DataRequired(), NumberRange(min=0)])
    discounted_price = DecimalField('Discounted Price', validators=[NumberRange(min=0)])
    stock_quantity = IntegerField('Stock Quantity', validators=[DataRequired(), NumberRange(min=0)])
    category_id = SelectField('Category', coerce=int, validators=[DataRequired()])
    is_active = BooleanField('Active')

class ReviewForm(FlaskForm):
    rating = SelectField('Rating', choices=[(5, '5 Stars'), (4, '4 Stars'), (3, '3 Stars'), (2, '2 Stars'), (1, '1 Star')], coerce=int)
    comment = TextAreaField('Comment', validators=[Length(max=500)])

class CheckoutForm(FlaskForm):
    shipping_address = TextAreaField('Shipping Address', validators=[DataRequired()])
    billing_address = TextAreaField('Billing Address', validators=[DataRequired()])
    payment_method = SelectField('Payment Method', choices=[('credit_card', 'Credit Card'), ('paypal', 'PayPal')])