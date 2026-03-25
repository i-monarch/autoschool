from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Tariff',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
                ('description', models.TextField(blank=True, default='', verbose_name='description')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='price')),
                ('duration_days', models.PositiveIntegerField(verbose_name='duration (days)')),
                ('features', models.JSONField(blank=True, default=list, verbose_name='features')),
                ('is_popular', models.BooleanField(default=False, verbose_name='popular')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='order')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'tariff',
                'verbose_name_plural': 'tariffs',
                'ordering': ['order', 'price'],
            },
        ),
    ]
