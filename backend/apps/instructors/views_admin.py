from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import Instructor
from .serializers import InstructorAdminSerializer


class InstructorPagination(PageNumberPagination):
    page_size = 20


class AdminInstructorListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = InstructorAdminSerializer
    pagination_class = InstructorPagination

    def get_queryset(self):
        qs = Instructor.objects.select_related('user', 'user__city')

        status_filter = self.request.query_params.get('status')
        if status_filter == 'pending':
            qs = qs.filter(is_verified=False)
        elif status_filter == 'verified':
            qs = qs.filter(is_verified=True)

        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(user__city__slug=city)

        return qs


class AdminInstructorDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = InstructorAdminSerializer
    queryset = Instructor.objects.select_related('user', 'user__city')


class AdminInstructorVerifyView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        instructor = Instructor.objects.filter(pk=pk).first()
        if not instructor:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        instructor.is_verified = True
        instructor.verification_note = ''
        instructor.save(update_fields=['is_verified', 'verification_note', 'updated_at'])
        return Response(InstructorAdminSerializer(instructor).data)


class AdminInstructorRejectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        instructor = Instructor.objects.filter(pk=pk).first()
        if not instructor:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        note = request.data.get('note', '')
        instructor.is_verified = False
        instructor.verification_note = note or ''
        instructor.save(update_fields=['is_verified', 'verification_note', 'updated_at'])
        return Response(InstructorAdminSerializer(instructor).data)


class AdminInstructorStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        instructors = Instructor.objects.all()
        return Response({
            'total': instructors.count(),
            'pending': instructors.filter(is_verified=False).count(),
            'verified': instructors.filter(is_verified=True).count(),
            # TODO Stage 2: replace 0 with active subscription count
            'with_active_subscription': 0,
        })
