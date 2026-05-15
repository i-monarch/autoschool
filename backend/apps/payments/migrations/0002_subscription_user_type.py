from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tariff',
            name='user_type',
            field=models.CharField(
                choices=[('student', 'student'), ('instructor', 'instructor')],
                db_index=True,
                default='student',
                max_length=20,
                verbose_name='user type',
            ),
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(verbose_name='expires at')),
                ('is_active', models.BooleanField(db_index=True, default=True, verbose_name='active')),
                ('payment_status', models.CharField(choices=[('pending', 'pending'), ('paid', 'paid'), ('failed', 'failed')], db_index=True, default='pending', max_length=10, verbose_name='payment status')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('tariff', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to='payments.tariff', verbose_name='tariff')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL, verbose_name='user')),
            ],
            options={
                'verbose_name': 'subscription',
                'verbose_name_plural': 'subscriptions',
                'db_table': 'subscriptions',
                'ordering': ['-created_at'],
            },
        ),
    ]
