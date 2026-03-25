from rest_framework import serializers
from .models import Region, ExamCenter, ExamRoute, RouteImage


class AdminRouteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteImage
        fields = ['id', 'center', 'image', 'source_url', 'order']
        read_only_fields = ['source_url']


class AdminExamRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoute
        fields = ['id', 'center', 'name', 'description', 'map_url', 'order']


class AdminExamCenterSerializer(serializers.ModelSerializer):
    routes = AdminExamRouteSerializer(many=True, read_only=True)
    images = AdminRouteImageSerializer(many=True, read_only=True)
    routes_count = serializers.IntegerField(source='routes.count', read_only=True)
    images_count = serializers.IntegerField(source='images.count', read_only=True)

    class Meta:
        model = ExamCenter
        fields = ['id', 'region', 'name', 'city', 'address', 'phone', 'lat', 'lng',
                  'source_url', 'order', 'routes', 'images', 'routes_count', 'images_count']


class AdminRegionSerializer(serializers.ModelSerializer):
    centers = AdminExamCenterSerializer(many=True, read_only=True)
    centers_count = serializers.IntegerField(source='centers.count', read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'order', 'centers', 'centers_count']
