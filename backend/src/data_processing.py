import pandas as pd

def process_stream_data(stream_data):
    if 'data' in stream_data and len(stream_data['data']) > 0:
        data = stream_data['data'][0]
        processed_data = {
            'user_id': data['user_id'],
            'user_name': data['user_name'],
            'game_id': data['game_id'],
            'viewer_count': data['viewer_count'],
            'started_at': data['started_at']
        }
        return pd.DataFrame([processed_data])
    else:
        print("No data available for the given user.")
        return pd.DataFrame()

if __name__ == "__main__":
    sample_data = {
        'data': [{
            'user_id': '12345',
            'user_name': 'nom_du_streamer',
            'game_id': '67890',
            'viewer_count': 100,
            'started_at': '2024-01-01T00:00:00Z'
        }]
    }
    df = process_stream_data(sample_data)
    print(df)
