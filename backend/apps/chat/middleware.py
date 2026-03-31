from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_str):
    try:
        token = AccessToken(token_str)
        return User.objects.get(pk=token['user_id'])
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get('headers', []))
        cookies_header = headers.get(b'cookie', b'').decode()

        token = None
        for cookie in cookies_header.split(';'):
            cookie = cookie.strip()
            if cookie.startswith('access_token='):
                token = cookie.split('=', 1)[1]
                break

        if not token:
            query = scope.get('query_string', b'').decode()
            for param in query.split('&'):
                if param.startswith('token='):
                    token = param.split('=', 1)[1]
                    break

        scope['user'] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)
