from rest_framework import generics, permissions
from .models import Region, ExamCenter
from .serializers import RegionSerializer, ExamCenterSerializer


class RegionListView(generics.ListAPIView):
    serializer_class = RegionSerializer
    queryset = Region.objects.prefetch_related('centers__routes', 'centers__images')
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]


class ExamCenterListView(generics.ListAPIView):
    serializer_class = ExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes', 'images')
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]


class ExamCenterDetailView(generics.RetrieveAPIView):
    serializer_class = ExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes', 'images')
    permission_classes = [permissions.IsAuthenticated]
