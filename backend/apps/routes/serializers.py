from rest_framework import serializers
from .models import Region, ExamCenter, ExamRoute, RouteImage


class RouteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteImage
        fields = ['id', 'image', 'source_url', 'video_url', 'order']


class ExamRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamRoute
        fields = ['id', 'name', 'description', 'map_url', 'order']


class ExamCenterSerializer(serializers.ModelSerializer):
    routes = ExamRouteSerializer(many=True, read_only=True)
    images = RouteImageSerializer(many=True, read_only=True)

    class Meta:
        model = ExamCenter
        fields = ['id', 'name', 'city', 'address', 'phone', 'lat', 'lng',
                  'order', 'routes', 'images']


class RegionSerializer(serializers.ModelSerializer):
    centers = ExamCenterSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'order', 'centers']


class RegionListSerializer(serializers.ModelSerializer):
    centers_count = serializers.IntegerField(source='centers.count', read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'order', 'centers_count']
