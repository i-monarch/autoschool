from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import PartnerSchool
from .serializers import AdminPartnerSerializer


class AdminPartnerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminPartnerSerializer
    queryset = PartnerSchool.objects.all()
    pagination_class = None


class AdminPartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminPartnerSerializer
    queryset = PartnerSchool.objects.all()


class AdminPartnerStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total = PartnerSchool.objects.count()
        active = PartnerSchool.objects.filter(is_active=True).count()
        cities = PartnerSchool.objects.filter(is_active=True).values_list('city', flat=True).distinct().count()
        return Response({
            'total': total,
            'active': active,
            'cities': cities,
        })
