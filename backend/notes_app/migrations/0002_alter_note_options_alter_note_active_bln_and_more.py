# Generated by Django 5.0.6 on 2024-07-02 20:20

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notes_app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='note',
            options={'ordering': ['-created_date'], 'verbose_name': 'Note', 'verbose_name_plural': 'Notes'},
        ),
        migrations.AlterField(
            model_name='note',
            name='active_bln',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='note',
            name='bg_color',
            field=models.CharField(default='transparent', max_length=50),
        ),
        migrations.AlterField(
            model_name='note',
            name='bg_image',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='note',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes_created_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='note',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notes_updated_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Label',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='labels_created_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Label',
                'verbose_name_plural': 'Labels',
                'ordering': ['-created_date'],
            },
        ),
        migrations.AddField(
            model_name='note',
            name='label',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='notes_app.label'),
        ),
    ]
