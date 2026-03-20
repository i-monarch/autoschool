from rest_framework import generics
from apps.core.permissions import IsAdmin
from .models import ExamCenter, ExamRoute
from .serializers_admin import AdminExamCenterSerializer, AdminExamRouteSerializer


class AdminCenterListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes')
    pagination_class = None


class AdminCenterDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes')


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
