from rest_framework import generics
from rest_framework.permissions import AllowAny

from apps.core.permissions import IsAdmin
from .models import City
from .serializers import AdminCitySerializer, CityListSerializer


class CityListView(generics.ListAPIView):
    queryset = City.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    serializer_class = CityListSerializer
    pagination_class = None


class AdminCityListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCitySerializer
    queryset = City.objects.all().order_by('order', 'name')
    pagination_class = None


class AdminCityDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCitySerializer
    queryset = City.objects.all()
