from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='ExamCenter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('city', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=300)),
                ('phone', models.CharField(blank=True, max_length=50)),
                ('lat', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('lng', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('source_url', models.URLField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('region', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='centers', to='routes.region')),
            ],
            options={
                'ordering': ['order', 'city', 'name'],
            },
        ),
        migrations.CreateModel(
            name='ExamRoute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('map_url', models.URLField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('center', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='routes', to='routes.examcenter')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='RouteImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(blank=True, null=True, upload_to='routes/images/')),
                ('source_url', models.URLField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('center', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='routes.examcenter')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
    ]
