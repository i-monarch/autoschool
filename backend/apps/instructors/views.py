from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Instructor
from .serializers import InstructorPublicSerializer, InstructorSelfSerializer


class InstructorPublicListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InstructorPublicSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Instructor.objects.select_related('user', 'user__city').filter(is_verified=True)
        # TODO Stage 2: filter by active subscription
        city = self.request.query_params.get('city')
        if city:
            qs = qs.filter(user__city__slug=city)
        return qs


class InstructorMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'instructor':
            return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        instructor = Instructor.objects.select_related('user', 'user__city').filter(user=request.user).first()
        if not instructor:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InstructorSelfSerializer(instructor).data)

    def post(self, request):
        if request.user.role != 'instructor':
            return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
        if Instructor.objects.filter(user=request.user).exists():
            return Response({'error': 'already_exists'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = InstructorSelfSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instructor = serializer.save(user=request.user)
        return Response(InstructorSelfSerializer(instructor).data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        if request.user.role != 'instructor':
            return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        instructor = Instructor.objects.filter(user=request.user).first()
        if not instructor:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InstructorSelfSerializer(instructor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
