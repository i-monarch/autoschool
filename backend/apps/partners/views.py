from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import PartnerSchool
from .serializers import PartnerSchoolListSerializer


class PartnerSchoolListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PartnerSchoolListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = PartnerSchool.objects.filter(is_active=True)
        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(city__icontains=city)
        return qs
