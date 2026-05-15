from rest_framework import serializers

from apps.cities.serializers import CityListSerializer
from .models import Instructor


class InstructorPublicSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    city = CityListSerializer(source='user.city', read_only=True)

    class Meta:
        model = Instructor
        fields = [
            'id', 'photo', 'car_photo', 'car_model', 'description',
            'price_per_hour', 'certificate_photo', 'is_official',
            'is_car_equipped', 'first_name', 'last_name', 'phone',
            'email', 'city', 'created_at',
        ]


class InstructorSelfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = [
            'id', 'photo', 'car_photo', 'car_model', 'description',
            'price_per_hour', 'certificate_photo', 'vin_code',
            'tech_passport', 'is_official', 'is_car_equipped',
            'is_verified', 'verification_note', 'created_at', 'updated_at',
        ]
        read_only_fields = ('is_verified', 'verification_note', 'created_at', 'updated_at')


class InstructorAdminSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    city = CityListSerializer(source='user.city', read_only=True)

    class Meta:
        model = Instructor
        fields = [
            'id', 'user_id', 'photo', 'car_photo', 'car_model',
            'description', 'price_per_hour', 'certificate_photo',
            'vin_code', 'tech_passport', 'is_official', 'is_car_equipped',
            'is_verified', 'verification_note', 'first_name', 'last_name',
            'phone', 'email', 'city', 'created_at', 'updated_at',
        ]
        read_only_fields = ('user_id', 'created_at', 'updated_at')
