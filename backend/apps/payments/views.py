from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Tariff
from .serializers import TariffListSerializer


class TariffListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TariffListSerializer
    queryset = Tariff.objects.filter(is_active=True)
    pagination_class = None
