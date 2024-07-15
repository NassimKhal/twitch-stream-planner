from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class StreamPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    streamer_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    theme = db.Column(db.String(100), nullable=True)
    image_data = db.Column(db.LargeBinary, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<StreamPlan {self.streamer_id} on {self.date}>'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    profile_image_url = db.Column(db.String(256), nullable=True)
    followers = db.Column(db.Integer, nullable=True)
    last_stream_date = db.Column(db.DateTime, nullable=True)
    last_stream_name = db.Column(db.String(150), nullable=True)
    last_stream_theme = db.Column(db.String(150), nullable=True)
    access_token = db.Column(db.String(500), nullable=True)
    twitter_username = db.Column(db.String(150), nullable=True)
    twitter_oauth_token = db.Column(db.String(500))
    twitter_oauth_token_secret = db.Column(db.String(500))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __init__(self, username, email, password_hash=None, access_token=None):
        self.username = username
        self.access_token = access_token
        self.email = email
        self.password_hash = password_hash

    def __repr__(self):
        return '<User %r>' % self.username
