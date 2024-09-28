from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Label(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='labels_created_by', on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Label"
        verbose_name_plural = "Labels"
        ordering = ['-created_date']

    def __str__(self):
        return self.name

    def clean(self):
        if not self.name:
            raise ValidationError("Name cannot be empty")

class Note(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    collaborators = models.JSONField(default=list, blank=True)  # JSONField to store list of emails
    labels = models.ManyToManyField(Label, related_name='note_labels', blank=True)
    bg_color = models.CharField(max_length=50, default='white')
    bg_image = models.CharField(max_length=200, blank=True, null=True)
    archive_bln = models.BooleanField(default=False)
    pin_bln = models.BooleanField(default=False)
    reminder_date = models.DateTimeField(blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='notes_created_by', on_delete=models.CASCADE)
    updated_date = models.DateTimeField(blank=True, null=True)
    updated_by = models.ForeignKey(User, related_name='notes_updated_by', on_delete=models.CASCADE, blank=True, null=True)
    active_bln = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        ordering = ['-created_date']

    def __str__(self):
        return self.title

    def clean(self):
        if not self.title:
            raise ValidationError("Title cannot be empty")

    def save(self, *args, **kwargs):
        if len(self.collaborators) != len(set(self.collaborators)):
            raise ValidationError("Duplicate emails are not allowed in collaborators")
        super().save(*args, **kwargs)
