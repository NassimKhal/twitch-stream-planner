import json
import requests
import schedule
import time
import base64
from PIL import Image
import io
import config

def publish_schedule():
    with open('schedule.json', 'r') as f:
        data = json.load(f)

    schedule_today = data.get('today', 'No schedule for today')

    with open('schedule.jpg', 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    tweet_data = {
        'message': schedule_today,
        'image': f'data:image/jpeg;base64,{image_data}'
    }

    response = requests.post(
        config.Config.SERVER_URL + '/publish_to_twitter',
        json=tweet_data
    )

    if response.status_code == 200:
        print("Tweet successfully published.")
    else:
        print(f"Failed to publish tweet: {response.json().get('message', 'Unknown error')}")

schedule.every().day.at("08:00").do(publish_schedule)

while True:
    schedule.run_pending()
    time.sleep(1)
