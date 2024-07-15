from app import app
from models import db, User

with app.app_context():
    user = User.query.first()
    print(f"Bio: {user.bio}")
    print(f"Profile Image URL: {user.profile_image_url}")
