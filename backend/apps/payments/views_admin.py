from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import Tariff
from .serializers_admin import AdminTariffSerializer, AdminTariffReorderSerializer


class AdminTariffListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminTariffSerializer
    queryset = Tariff.objects.all()
    pagination_class = None


class AdminTariffDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminTariffSerializer
    queryset = Tariff.objects.all()


class AdminTariffReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminTariffReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        for i, tariff_id in enumerate(ser.validated_data['ordered_ids']):
            Tariff.objects.filter(id=tariff_id).update(order=i)

        return Response({'status': 'ok'})


class AdminTariffStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        tariffs = Tariff.objects.all()
        return Response({
            'total': tariffs.count(),
            'active': tariffs.filter(is_active=True).count(),
        })
