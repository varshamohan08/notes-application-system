# Generated by Django 5.1 on 2024-08-25 21:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notes_app', '0002_alter_note_options_alter_note_active_bln_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='note',
            name='label',
        ),
        migrations.AddField(
            model_name='note',
            name='labels',
            field=models.ManyToManyField(blank=True, related_name='note_labels', to='notes_app.label'),
        ),
    ]