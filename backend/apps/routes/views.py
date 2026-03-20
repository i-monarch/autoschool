from rest_framework import generics, permissions
from .models import ExamCenter
from .serializers import ExamCenterSerializer


class ExamCenterListView(generics.ListAPIView):
    serializer_class = ExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes')
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]


class ExamCenterDetailView(generics.RetrieveAPIView):
    serializer_class = ExamCenterSerializer
    queryset = ExamCenter.objects.prefetch_related('routes')
    permission_classes = [permissions.IsAuthenticated]
