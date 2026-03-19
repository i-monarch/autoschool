from django.urls import path

from ..views import DeactivateDeviceView, MeView, MyDevicesView

urlpatterns = [
    path('me/', MeView.as_view(), name='user-me'),
    path('me/devices/', MyDevicesView.as_view(), name='user-devices'),
    path('me/devices/<int:pk>/', DeactivateDeviceView.as_view(), name='device-deactivate'),
]
