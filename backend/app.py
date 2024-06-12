import tweepy
from flask import Flask, request, jsonify, render_template, url_for, flash, redirect
from flask_cors import CORS
from flask_login import UserMixin, LoginManager, login_user, current_user, logout_user, login_required
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from werkzeug.security import generate_password_hash, check_password_hash
from models import User

app = Flask(__name__)
CORS(app)  # Permettre les requêtes CORS pour toutes les routes
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'  # Rediriger les utilisateurs non authentifiés vers la page de login
from . import routes, models
login_manager.login_message_category = 'info'
consumer_key = 'M7VIunJcPuyijAmSR0XCsGC4c'
consumer_secret = 'P4l9TO9BTJCGwmZ4jl6aKYVwEHJ4FHVDQNTnuASvbT3b0MLlsi'
access_token = '1800550086113411072-uzXG3wFJPqxdd8EPpVtyMAJWPFCw0g'
access_token_secret = '3yNS1CPQucUrKYCU6zPSrtWLNQFZnyXfZu5rVKZ3KlBFd'
# bearer_token = 'AAAAAAAAAAAAAAAAAAAAAC0EuQEAAAAALUMzuY14%2FXyO1k20Ip2HuQLsNtI%3DU9IjpXYZoIkJjY9xFp7uAjIeQQoFVbLanjaWXqeSngerKtxg4L'
# Création de la bdd
db.create_all()
# Authentification avec Tweepy
client = tweepy.Client(
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    access_token=access_token,
    access_token_secret=access_token_secret
)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.json
    print(data)  # Imprime les données reçues dans le terminal
    return jsonify({"message": "Data received"}), 200

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/2/tweets', methods=['POST'])
def tweet():
    content = request.json
    tweet_text = content.get('message')

    try:
        client.create_tweet(text=tweet_text)
        return jsonify({"message": "Tweet sent!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/register", methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        user = User(username=username, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user, remember=request.form.get('remember'))
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html')

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route("/account")
@login_required
def account():
    return render_template('account.html', title='Account')        
        

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)