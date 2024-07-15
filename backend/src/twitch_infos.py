import config
from oauth import twitch
import logging

def get_twitch_profile_info(username, access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',  # Passez 'access_token' comme paramètre
        'Client-ID': config.TWITCH_CLIENT_ID
    }
    user_info = twitch.get('users', headers=headers, token={'access_token': access_token}).json()['data'][0]
    user_id = user_info['id']
    followers_response = twitch.get(f'channels/followers?broadcaster_id={user_id}', headers=headers, token={'access_token': access_token}).json()
    followers = followers_response.get('total', 0)
    streams = twitch.get(f'streams?user_id={user_info["id"]}', headers=headers, token={'access_token': access_token}).json()['data']

    if streams:
        last_stream = streams[0]
        last_stream_date = last_stream['started_at']
        last_stream_title = last_stream['title']
        last_stream_theme = last_stream['game_name']  # Assuming 'game_name' represents the theme
    else:
        last_stream_date = None
        last_stream_title = None
        last_stream_theme = None

    return {
        'username': user_info['display_name'],
        'profile_image_url': user_info['profile_image_url'],
        'bio': user_info['description'],
        'followers': followers,
        'last_stream_date': last_stream_date,
        'last_stream_title': last_stream_title,
        'last_stream_theme': last_stream_theme
    }

def update_twitch_bio(access_token, new_bio):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Client-ID': config.TWITCH_CLIENT_ID,
        'Content-Type': 'application/json'
    }
    data = {'description': new_bio}
    response = twitch.put('users', headers=headers, json=data, token={'access_token': access_token})
    logging.info(f"Twitch update bio response: {response.status_code}, {response.json()}")
    return response