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
        representation['bln_selected'] = False
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
    labels = LabelSerializer(many=True, read_only=True)
    collaborators = serializers.ListField(child=serializers.EmailField(), read_only=True)
    created_date = serializers.DateTimeField(format="%d %B %Y %I:%M %p", read_only=True)

    class Meta:
        model = Note
        fields = [
            'id',
            'title',
            'description',
            'collaborators',
            'labels',
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
        representation['collaborators'] = [email for email in instance.collaborators]

        request = self.context.get('request')
        if request:
            representation['collaborated_bln'] = request.user != instance.created_by and request.user.email in instance.collaborators

        representation['labels'] = {label.id: label.name for label in instance.labels.all() if request.user.id == label.created_by.id}

        return representation

    def create(self, validated_data):
        # import pdb;pdb.set_trace()
        request = self.context.get('request')
        collaborators_emails = request.data.get('collaborators', []) or []
        label_ids = request.data.get('labels', []) or []
        validated_data['created_by'] = request.user

        note = Note.objects.create(**validated_data)
        note.collaborators = collaborators_emails
        note.labels.set(label_ids)
        note.save()
        return note

    def update(self, instance, validated_data):
        request = self.context.get('request')
        collaborators_emails = request.data.get('collaborators', [])
        label_ids = request.data.get('labels', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.updated_by = request.user
        instance.collaborators = collaborators_emails
        instance.labels.set(label_ids)

        if instance.archive_bln and instance.pin_bln:
            instance.pin_bln= False

        instance.save()
        return instance

    def validate_collaborators(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Collaborators must be a list")
        for email in value:
            if not isinstance(email, str) or '@' not in email:
                raise serializers.ValidationError(f"Invalid email address: {email}")
        return value

    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title cannot be empty")
        return value
