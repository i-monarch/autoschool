from rest_framework import serializers
from .models import ExamCenter, ExamRoute


class ExamRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoute
        fields = ['id', 'name', 'description', 'map_url', 'order']


class ExamCenterSerializer(serializers.ModelSerializer):
    routes = ExamRouteSerializer(many=True, read_only=True)

    class Meta:
        model = ExamCenter
        fields = ['id', 'name', 'city', 'address', 'phone', 'lat', 'lng', 'order', 'routes']


class ExamCenterListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamCenter
        fields = ['id', 'name', 'city', 'address', 'phone', 'order']
