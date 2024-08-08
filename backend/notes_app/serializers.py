from user_app.serializers import UserSerializer
from .models import Label, Note
from rest_framework import serializers

class LabelSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    # updated_by = UserSerializer(read_only=True)

    class Meta:
        model = Label
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['bln_disabled'] = True
        representation['bln_hovered'] = False
        return representation

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user

        label = Label.objects.create(**validated_data)
        return label

    def update(self, instance, validated_data):
        request = self.context.get('request')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # instance.updated_by = request.user
        instance.save()
        return instance

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name cannot be empty")
        return value
class NoteSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    collaborators = UserSerializer(many=True, read_only=True)  # Assuming UserSerializer handles User instances

    class Meta:
        model = Note
        fields = [
            'id',
            'title',
            'description',
            'collaborators',
            'label',
            'bg_color',
            'bg_image',
            'archive_bln',
            'pin_bln',
            'reminder_date',
            'created_date',
            'created_by',
            'updated_date',
            'updated_by',
            'active_bln',
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

        # instance.updated_by = request.user
        instance.save()
        instance.collaborators.set(collaborators_data)
        return instance

    # def validate_bg_color(self, value):
    #     if value and not value.startswith('#'):
    #         raise serializers.ValidationError("Background color must be a valid hex color code")
    #     return value

    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title cannot be empty")
        return value
