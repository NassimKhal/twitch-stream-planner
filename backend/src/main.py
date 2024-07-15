from twitch_api import get_stream_data
from data_processing import process_stream_data
from twitter_integration import tweet

def main():
    user_login = 'NassLB'
    stream_data = get_stream_data(user_login)
    df = process_stream_data(stream_data)
    if not df.empty:
        message = f"Stream de {df['user_name'][0]} en cours avec {df['viewer_count'][0]} spectateurs!"
        tweet(message)

if __name__ == "__main__":
    main()
