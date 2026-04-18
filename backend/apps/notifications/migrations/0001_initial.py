from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyReminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enabled', models.BooleanField(default=True)),
                ('monday', models.TimeField(blank=True, null=True)),
                ('tuesday', models.TimeField(blank=True, null=True)),
                ('wednesday', models.TimeField(blank=True, null=True)),
                ('thursday', models.TimeField(blank=True, null=True)),
                ('friday', models.TimeField(blank=True, null=True)),
                ('saturday', models.TimeField(blank=True, null=True)),
                ('sunday', models.TimeField(blank=True, null=True)),
                ('message', models.CharField(blank=True, max_length=255)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='study_reminder',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'study_reminders',
            },
        ),
    ]
