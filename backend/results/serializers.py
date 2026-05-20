from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'register_number', 'image', 'image_url', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
