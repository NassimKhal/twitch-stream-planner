# backend/src/twitter_integration.py

import tweepy
import config
import requests
from requests_oauthlib import OAuth1

def create_twitter_api(oauth_token, oauth_token_secret):
    auth = tweepy.OAuth1UserHandler(
        config.TWITTER_API_KEY, 
        config.TWITTER_API_SECRET_KEY, 
        oauth_token, 
        oauth_token_secret
    )
    api = tweepy.API(auth, wait_on_rate_limit=True)
    return api

def upload_media_v1(image_path, oauth_token, oauth_token_secret):
    url = "https://upload.twitter.com/1.1/media/upload.json"
    auth = OAuth1(
        config.TWITTER_API_KEY,
        config.TWITTER_API_SECRET_KEY,
        oauth_token,
        oauth_token_secret
    )
    with open(image_path, 'rb') as file:
        files = {'media': file}
        response = requests.post(url, auth=auth, files=files)
    if response.status_code != 200:
        print(f"Error uploading media: {response.status_code} {response.text}")
        return None, response.text
    media_id = response.json().get('media_id_string')
    return media_id, response.text

def tweet_with_media_v2(api, message, media_id):
    url = "https://api.twitter.com/2/tweets"
    auth = OAuth1(
        config.TWITTER_API_KEY,
        config.TWITTER_API_SECRET_KEY,
        api.auth.access_token,
        api.auth.access_token_secret
    )
    payload = {
        "text": message,
        "media": {
            "media_ids": [media_id]
        }
    }
    response = requests.post(url, auth=auth, json=payload)
    if response.status_code != 201:
        print(f"Error tweeting: {response.status_code} {response.text}")
    return response.text

def get_twitter_username(api):
    try:
        user = api.verify_credentials()
        return user.screen_name
    except tweepy.TweepyException as e:
        print(f"Error while fetching Twitter username: {e}")
        return None

