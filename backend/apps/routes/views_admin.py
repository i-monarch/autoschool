from rest_framework import generics, parsers
from apps.core.permissions import IsAdmin
from .models import Region, ExamCenter, ExamRoute, RouteImage
from .serializers_admin import (
    AdminRegionSerializer, AdminExamCenterSerializer,
    AdminExamRouteSerializer, AdminRouteImageSerializer,
)


class AdminRegionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminRegionSerializer
    queryset = Region.objects.prefetch_related('centers__routes', 'centers__images')
    pagination_class = None


class AdminRegionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminRegionSerializer
    queryset = Region.objects.prefetch_related('centers__routes', 'centers__images')


class AdminCenterListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamCenterSerializer
    pagination_class = None

    def get_queryset(self):
        qs = ExamCenter.objects.prefetch_related('routes', 'images')
        region_id = self.request.query_params.get('region')
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs


class AdminCenterDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes', 'images')


class AdminRouteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamRouteSerializer
    pagination_class = None

    def get_queryset(self):
        qs = ExamRoute.objects.select_related('center')
        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(center_id=center_id)
        return qs


class AdminRouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamRouteSerializer
    queryset = ExamRoute.objects.select_related('center')


class AdminImageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminRouteImageSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    pagination_class = None

    def get_queryset(self):
        qs = RouteImage.objects.select_related('center')
        center_id = self.request.query_params.get('center')
        if center_id:
            qs = qs.filter(center_id=center_id)
        return qs


class AdminImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminRouteImageSerializer
    queryset = RouteImage.objects.select_related('center')
