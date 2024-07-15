from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from flask_login import LoginManager, current_user, login_user, logout_user, login_required
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix
import logging
import io
import base64
from PIL import Image
import os
from twitch_infos import get_twitch_profile_info, update_twitch_bio
from twitter_integration import create_twitter_api, upload_media_v1, tweet_with_media_v2, get_twitter_username
import config
from oauth import oauth, twitch, twitter
from models import db, User, Schedule, StreamPlan

app = Flask(__name__, static_folder='../static', template_folder='../templates')
app.config.from_object('config.Config')
CORS(app, supports_credentials=True)
oauth.init_app(app)

db.init_app(app)
migrate = Migrate(app, db)

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
app.logger.setLevel(logging.DEBUG)

login_manager = LoginManager(app)
login_manager.login_view = 'login'

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return redirect(url_for('home'))

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        twitch_info = get_twitch_profile_info(current_user.username, current_user.access_token)
        current_user.profile_image_url = twitch_info.get('profile_image_url')
        return jsonify({
            'authenticated': True,
            'username': current_user.username,
            'profile_image_url': current_user.profile_image_url
        })
    else:
        return jsonify({'authenticated': False})

@app.route('/auth/twitch/callback')
def authorize():
    try:
        access_token = twitch.authorize_access_token()
        app.logger.info(f"Token: {access_token}")
        resp = twitch.get('users', token=access_token, headers={'Client-ID': config.TWITCH_CLIENT_ID})
        app.logger.info(f"Response from Twitch: {resp.json()}")
        user_data = resp.json()
        
        user_info = user_data['data'][0]
        username = user_info.get('login', None)
        email = user_info.get('email', None)

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(username=username, email=email, access_token=access_token['access_token'])
            db.session.add(user)
            db.session.commit()
        else:
            user.access_token = access_token['access_token']
        login_user(user, remember=True)
        return redirect('/')
    except Exception as e:
        app.logger.error(f"Error during Twitch authorization: {e}")
        return redirect(url_for('login'))

@app.route('/auth/twitter')
@login_required
def twitter_callback():
    try:
        token = twitter.authorize_access_token()
        resp = twitter.get('https://api.twitter.com/1.1/account/verify_credentials.json')
        twitter_info = resp.json()
        current_user.twitter_oauth_token = token['oauth_token']
        current_user.twitter_oauth_token_secret = token['oauth_token_secret']
        current_user.twitter_username = twitter_info['screen_name']
        db.session.commit()
        flash('Twitter account linked successfully', 'success')
        return redirect(url_for('profile'))
    except Exception as e:
        app.logger.error(f"Error during Twitter authorization: {e}")
        return redirect(url_for('profile'))

@app.route('/is_twitter_linked')
@login_required
def is_twitter_linked():
    return jsonify({"twitter_linked": current_user.twitter_username is not None})

@app.route('/api/check_twitter_link', methods=['GET'])
@login_required
def check_twitter_link():
    return jsonify({"isLinked": current_user.twitter_username is not None})

@app.route('/login', methods=['GET'])
def login():
    try:
        redirect_uri = url_for('authorize', _external=True, _scheme='https')
        app.logger.info(f"Redirect URI: {redirect_uri}")
        return twitch.authorize_redirect(redirect_uri)
    except Exception as e:
        app.logger.error(f"Error during login redirection: {e}")
        return render_template('error.html', message="Login redirection failed.")


@app.route('/api/profile', methods=['GET'])
@login_required
def api_get_profile():
    try:
        twitch_info = get_twitch_profile_info(current_user.username, current_user.access_token)
        current_user.profile_image_url = twitch_info.get('profile_image_url')
        current_user.followers = twitch_info.get('followers')
        current_user.bio = twitch_info.get('bio')
        current_user.last_stream_date = twitch_info.get('last_stream_date')
        current_user.last_stream_name = twitch_info.get('last_stream_title')
        current_user.last_stream_theme = twitch_info.get('last_stream_theme')
        db.session.commit()

        twitter_linked = current_user.twitter_username is not None

        return jsonify({
            "user": {
                "username": current_user.username,
                "email": current_user.email,
                "followers": current_user.followers,
                "bio": current_user.bio,
                "profile_image_url": current_user.profile_image_url,
                "last_stream_date": current_user.last_stream_date,
                "last_stream_name": current_user.last_stream_name,
                "last_stream_theme": current_user.last_stream_theme,
                "twitter_username": current_user.twitter_username
            },
            "twitter_linked": twitter_linked
        })
    except Exception as e:
        app.logger.error(f"Error fetching profile: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch profile"}), 500

@app.route('/api/profile', methods=['POST'])
@login_required
def api_update_profile():
    try:
        data = request.json
        new_bio = data.get('bio')
        response = update_twitch_bio(current_user.access_token, new_bio)
        if response.status_code == 200:
            current_user.bio = new_bio
            db.session.commit()
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to update profile on Twitch"}), 400
    except Exception as e:
        app.logger.error(f"Error updating profile: {e}")
        return jsonify({"status": "error", "message": "Failed to update profile"}), 500

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    try:
        if request.method == 'POST':
            if 'confirm' in request.form:
                new_bio = request.form['bio']
                response = update_twitch_bio(current_user.access_token, new_bio)
                if response.status_code == 200:
                    current_user.bio = new_bio
                    db.session.commit()
                    flash('Profile updated successfully', 'success')
                else:
                    flash('Failed to update profile on Twitch', 'danger')
            return app.send_static_file('index.html')

        twitch_info = get_twitch_profile_info(current_user.username, current_user.access_token)
        current_user.profile_image_url = twitch_info.get('profile_image_url')
        current_user.followers = twitch_info.get('followers')
        current_user.bio = twitch_info.get('bio')
        current_user.last_stream_date = twitch_info.get('last_stream_date')
        current_user.last_stream_name = twitch_info.get('last_stream_title')
        current_user.last_stream_theme = twitch_info.get('last_stream_theme')
        db.session.commit()

        twitter_linked = current_user.twitter_username is not None

        return render_template('profile.html', user=current_user, twitter_linked=twitter_linked)
    except Exception as e:
        app.logger.error(f"Error fetching profile page: {e}")
        return render_template('error.html', message="Failed to load profile page")

@app.route('/link_twitter')
@login_required
def link_twitter():
    try:
        redirect_uri = url_for('twitter_callback', _external=True)
        return twitter.authorize_redirect(redirect_uri)
    except Exception as e:
        app.logger.error(f"Error during Twitter link redirection: {e}")
        return render_template('error.html', message="Twitter link redirection failed")

@app.route('/api/unlink_twitter', methods=['POST'])
@login_required
def unlink_twitter():
    try:
        current_user.twitter_username = None
        current_user.twitter_oauth_token = None
        current_user.twitter_oauth_token_secret = None
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        app.logger.error(f"Error unlinking Twitter: {e}")
        return jsonify({"status": "error", "message": "Failed to unlink Twitter"}), 500

@app.route('/schedule', methods=['GET'])
@login_required
def schedule():
    try:
        return app.send_static_file('index.html')
    except Exception as e:
        app.logger.error(f"Error loading schedule page: {e}")
        return render_template('error.html', message="Failed to load schedule page")

@app.route('/save_schedule', methods=['POST'])
@login_required
def save_schedule():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        image_data = data.get('image')
        if not image_data:
            return jsonify({"status": "error", "message": "No image data provided"}), 400

        plan = StreamPlan(streamer_id=current_user.id, image_data=image_data)
        db.session.add(plan)
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        app.logger.error(f"Error saving schedule: {e}")
        return jsonify({"status": "error", "message": "Failed to save schedule"}), 500

@app.route('/publish_to_twitter', methods=['POST'])
@login_required
def publish_to_twitter():
    try:
        app.logger.info("Request received at /publish_to_twitter endpoint")

        data = request.json
        if not data:
            app.logger.warning("No data provided in the request")
            return jsonify({"status": "error", "message": "No data provided"}), 400

        message = data.get('message')
        image_data = data.get('image')

        if not message:
            app.logger.warning("No message provided in the request")
            return jsonify({"status": "error", "message": "No message provided"}), 400

        if not image_data:
            app.logger.warning("No image data provided in the request")
            return jsonify({"status": "error", "message": "No image data provided"}), 400

        app.logger.debug("Decoding image data")
        image = Image.open(io.BytesIO(base64.b64decode(image_data.split(',')[1])))
        image_path = os.path.join('schedule.jpg')

        app.logger.debug("Saving image to %s", image_path)
        image.save(image_path)

        app.logger.info("Publishing tweet with message: %s", message)

        twitter_api = create_twitter_api(current_user.twitter_oauth_token, current_user.twitter_oauth_token_secret)
        media_id, media_response = upload_media_v1(image_path, current_user.twitter_oauth_token, current_user.twitter_oauth_token_secret)
        app.logger.debug(f"Media upload response: {media_response}")

        if media_id:
            tweet_response = tweet_with_media_v2(twitter_api, message, media_id)
            app.logger.debug(f"Tweet response: {tweet_response}")

            twitter_username = get_twitter_username(twitter_api)
            if twitter_username:
                app.logger.info(f"Tweet published from: @{twitter_username}")

        app.logger.debug("Removing image file %s", image_path)
        os.remove(image_path)

        app.logger.info("Tweet published successfully")
        return jsonify({"status": "success"})
    except Exception as e:
        app.logger.error("Error publishing to Twitter: %s", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/get_twitch_user', methods=['GET'])
@login_required
def get_twitch_user():
    return jsonify({'username': current_user.username}), 200

@app.route('/api/twitch_username', methods=['GET'])
@login_required
def get_twitch_username():
    return jsonify({"twitch_username": current_user.username})

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    app.run(host="0.0.0.0", port=5000, debug=True)
