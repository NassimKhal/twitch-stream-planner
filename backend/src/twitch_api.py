import requests
import config

import logging

logging.basicConfig(level=logging.DEBUG)

def get_stream_data(user_login):
    url = f"https://api.twitch.tv/helix/streams?user_login={user_login}"
    headers = {
        'Client-ID': config.TWITCH_CLIENT_ID,
        'Authorization': f"Bearer {config.TWITCH_OAUTH}"
    }
    response = requests.get(url, headers=headers)
    
    logging.debug(f"Request URL: {url}")
    logging.debug(f"Request Headers: {headers}")
    logging.debug(f"Response Status Code: {response.status_code}")
    logging.debug(f"Response Content: {response.content}")

    response.raise_for_status()
    return response.json()