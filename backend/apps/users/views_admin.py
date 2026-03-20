from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from apps.core.permissions import IsAdmin
from .models import User
from .serializers_admin import (
    AdminStudentListSerializer,
    AdminStudentDetailSerializer,
    AdminStudentPaymentSerializer,
)


class StudentPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminStudentListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminStudentListSerializer
    pagination_class = StudentPagination

    def get_queryset(self):
        qs = User.objects.filter(role='student').annotate(
            tests_count=Count('test_attempts')
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(phone__icontains=search)
            )

        paid_filter = self.request.query_params.get('paid')
        if paid_filter == 'true':
            qs = qs.filter(is_paid=True)
        elif paid_filter == 'false':
            qs = qs.filter(is_paid=False)

        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ('created_at', '-created_at', 'first_name', '-first_name', 'tests_count', '-tests_count'):
            qs = qs.order_by(ordering)

        return qs


class AdminStudentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminStudentDetailSerializer
    queryset = User.objects.filter(role='student')


class AdminStudentPaymentView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role='student')
        except User.DoesNotExist:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        ser = AdminStudentPaymentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        student.is_paid = ser.validated_data['is_paid']
        student.paid_until = ser.validated_data.get('paid_until')
        student.save(update_fields=['is_paid', 'paid_until'])

        return Response({'status': 'ok', 'is_paid': student.is_paid})


class AdminStudentStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        students = User.objects.filter(role='student')
        return Response({
            'total': students.count(),
            'active': students.filter(is_active=True).count(),
            'paid': students.filter(is_paid=True).count(),
            'unpaid': students.filter(is_paid=False).count(),
        })
