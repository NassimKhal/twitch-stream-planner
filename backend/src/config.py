
TWITCH_CLIENT_ID = '2b4yictdugaz6a1gm65kptd00moikb'
TWITCH_CLIENT_SECRET = 'd76bm2rim4riw0glfcogs2i6sa3bly'
TWITCH_OAUTH = '751ryfmn3u53victlg14r096zzq9wb'
TWITTER_API_KEY = 'GwROXCXHlgM9IaV9ustJJxysS'
TWITTER_API_SECRET_KEY = 'fyrd2Gvur8kgo7mZk3JeRKVv7ifBBWavhB3xyalOOjmevEQFha'
TWITTER_ACCESS_TOKEN = '1800550086113411072-t3TwmuDNd8vxB812IAVu6tNlvrJ5CI'
TWITTER_ACCESS_TOKEN_SECRET = 'omkwepnZZDmcDqQC0wN1GCRXvBKkDadCKsHxse1869YnE'
TWITTER_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAC0EuQEAAAAA86XxBouMSQz2RwmLpUnO5sfGW%2Fw%3DNiKTC4jBdcxUOhnMVYhry5tIL1rzgN0ZoUvMOae2RgzHm4TiY1'
DATABASE_URL = 'infra.cxm4i062y4jc.us-west-2.rds.amazonaws.com'
SERVER_URL = 'flask.twitch-stream-planner.uk'

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'une_cle_secrete_tres_complexe'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///db.sqlite'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TWITTER_ACCESS_TOKEN = os.environ.get('TWITTER_ACCESS_TOKEN')
    TWITTER_ACCESS_TOKEN_SECRET = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
    SERVER_URL = os.environ.get('SERVER_URL') or 'http://localhost:5000'
