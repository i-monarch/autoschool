from rest_framework import serializers
from .models import PartnerSchool


class PartnerSchoolListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerSchool
        fields = [
            'id', 'name', 'slug', 'description', 'logo',
            'city', 'address', 'phone', 'website', 'email',
            'services', 'price_from', 'rating',
        ]


class AdminPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerSchool
        fields = [
            'id', 'name', 'slug', 'description', 'logo',
            'city', 'address', 'phone', 'website', 'email',
            'services', 'price_from', 'rating', 'is_active', 'order',
        ]
