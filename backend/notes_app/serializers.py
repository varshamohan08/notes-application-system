from user_app.serializers import UserSerializer
from .models import Label, Note
from rest_framework import serializers

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = '__all__'

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name cannot be empty")
        return value

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'collaborators', 'bg_color', 'bg_image', 'archive_bln', 'pin_bln', 'reminder_date', 'created_date', 'updated_date', 'updated_by', 'active_bln'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['collaborators'] = UserSerializer(instance.collaborators.all(), many=True).data
        return representation

    def create(self, validated_data):
        request = self.context.get('request')
        collaborators_data = validated_data.pop('collaborators', [])
        validated_data['created_by'] = request.user

        note = Note.objects.create(**validated_data)
        note.collaborators.set(collaborators_data)
        return note

    def update(self, instance, validated_data):
        request = self.context.get('request')
        collaborators_data = validated_data.pop('collaborators', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.updated_by = request.user
        instance.save()
        instance.collaborators.set(collaborators_data)
        return instance

    def validate_bg_color(self, value):
        if value and not value.startswith('#'):
            raise serializers.ValidationError("Background color must be a valid hex color code")
        return value

    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title cannot be empty")
        return value
