# src/forms.py

from flask_wtf import FlaskForm
from wtforms import DateTimeField, StringField, SubmitField, PasswordField, TextAreaField
from wtforms.validators import DataRequired, Length

class PlanForm(FlaskForm):
    date = DateTimeField('Date and Time', format='%d/%m/%Y %H:%M', validators=[DataRequired()])
    theme = StringField('Theme', validators=[DataRequired()])
    submit = SubmitField('Schedule Stream')

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Register')

class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=150)])
    bio = TextAreaField('Bio', validators=[Length(max=500)])
    profile_image_url = StringField('Profile Image URL', validators=[Length(max=256)])
    submit = SubmitField('Update Profile')
