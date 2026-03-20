from rest_framework import serializers
from .models import ExamCenter, ExamRoute


class AdminExamRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoute
        fields = ['id', 'center', 'name', 'description', 'map_url', 'order']


class AdminExamCenterSerializer(serializers.ModelSerializer):
    routes = AdminExamRouteSerializer(many=True, read_only=True)
    routes_count = serializers.IntegerField(source='routes.count', read_only=True)

    class Meta:
        model = ExamCenter
        fields = ['id', 'name', 'city', 'address', 'phone', 'lat', 'lng', 'order',
                  'routes', 'routes_count']
