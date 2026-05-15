from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import City
from .serializers import CityListSerializer


class CityListView(generics.ListAPIView):
    queryset = City.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    serializer_class = CityListSerializer
    pagination_class = None
