from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserDevice
from .serializers import RegisterSerializer, UserDeviceSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        response = Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )
        self._set_auth_cookies(response, refresh)
        return response

    def _set_auth_cookies(self, response, refresh):
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            samesite='Lax',
            max_age=15 * 60,
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return Response(
                {'error': 'invalid_credentials', 'message': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'error': 'account_disabled', 'message': 'Account is disabled.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            samesite='Lax',
            max_age=15 * 60,
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
        )
        return response


class LogoutView(APIView):
    def post(self, request):
        token = request.COOKIES.get('refresh_token')
        if token:
            try:
                RefreshToken(token).blacklist()
            except Exception:
                pass

        response = Response({'message': 'Logged out.'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.COOKIES.get('refresh_token')
        if not token:
            return Response(
                {'error': 'no_token', 'message': 'No refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(token)
            new_access = str(refresh.access_token)

            refresh.blacklist()
            new_refresh = RefreshToken.for_user(
                User.objects.get(id=refresh['user_id'])
            )

            response = Response({'message': 'Token refreshed.'})
            response.set_cookie(
                'access_token', new_access,
                httponly=True, samesite='Lax', max_age=15 * 60,
            )
            response.set_cookie(
                'refresh_token', str(new_refresh),
                httponly=True, samesite='Lax', max_age=7 * 24 * 60 * 60,
            )
            return response
        except Exception:
            return Response(
                {'error': 'invalid_token', 'message': 'Invalid or expired token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class MyDevicesView(generics.ListAPIView):
    serializer_class = UserDeviceSerializer

    def get_queryset(self):
        return UserDevice.objects.filter(user=self.request.user, is_active=True)


class DeactivateDeviceView(APIView):
    def delete(self, request, pk):
        device = UserDevice.objects.filter(user=request.user, pk=pk, is_active=True).first()
        if not device:
            return Response(status=status.HTTP_404_NOT_FOUND)
        device.is_active = False
        device.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)
