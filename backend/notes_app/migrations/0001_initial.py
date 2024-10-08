# Generated by Django 5.0.6 on 2024-06-16 19:06

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('bg_color', models.CharField(blank=True, max_length=50, null=True)),
                ('bg_image', models.CharField(blank=True, max_length=50, null=True)),
                ('archive_bln', models.BooleanField(default=False)),
                ('pin_bln', models.BooleanField(default=False)),
                ('reminder_date', models.DateTimeField(blank=True, null=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(blank=True, null=True)),
                ('active_bln', models.BooleanField(default=False)),
                ('collaborators', models.ManyToManyField(blank=True, related_name='collaborated_notes', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_notes', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='updated_notes', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
