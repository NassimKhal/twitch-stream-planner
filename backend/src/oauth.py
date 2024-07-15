from authlib.integrations.flask_client import OAuth
import config

oauth = OAuth()

twitch = oauth.register(
    name='twitch',
    client_id=config.TWITCH_CLIENT_ID,
    client_secret=config.TWITCH_CLIENT_SECRET,
    access_token_url='https://id.twitch.tv/oauth2/token',
    authorize_url='https://id.twitch.tv/oauth2/authorize',
    api_base_url='https://api.twitch.tv/helix/',
    client_kwargs={'scope': 'user:read:email user:read:broadcast user:read:follows user:edit:broadcast user:edit moderator:read:followers', 'token_endpoint_auth_method': 'client_secret_post'},
    redirect_uri='https://a46a0c7028e43487199fd804ead6506d-841247637.us-west-2.elb.amazonaws.com/auth/twitch/callback',
    request_token_params={'scope': 'user:read:email user:read:broadcast user:read:follows user:edit:broadcast user:edit moderator:read:followers'}
)

twitter = oauth.register(
    name='twitter',
    client_id=config.TWITTER_API_KEY,
    client_secret=config.TWITTER_API_SECRET_KEY,
    request_token_url='https://api.twitter.com/oauth/request_token',
    authorize_url='https://api.twitter.com/oauth/authenticate',
    access_token_url='https://api.twitter.com/oauth/access_token',
    client_kwargs={'scope': 'tweet.read tweet.write users.read offline.access'},
    redirect_uri='https://a46a0c7028e43487199fd804ead6506d-841247637.us-west-2.elb.amazonaws.com/auth/twitter'
)
