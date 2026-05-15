from django.core.management.base import BaseCommand

from apps.cities.models import City


CITIES = [
    {'name': 'Київ', 'slug': 'kyiv', 'region': 'м.Київ', 'order': 0},
    {'name': 'Харків', 'slug': 'kharkiv', 'region': 'Харківська', 'order': 1},
    {'name': 'Одеса', 'slug': 'odesa', 'region': 'Одеська', 'order': 2},
    {'name': 'Дніпро', 'slug': 'dnipro', 'region': 'Дніпропетровська', 'order': 3},
    {'name': 'Донецьк', 'slug': 'donetsk', 'region': 'Донецька', 'order': 4},
    {'name': 'Запоріжжя', 'slug': 'zaporizhzhia', 'region': 'Запорізька', 'order': 5},
    {'name': 'Львів', 'slug': 'lviv', 'region': 'Львівська', 'order': 6},
    {'name': 'Кривий Ріг', 'slug': 'kryvyi-rih', 'region': 'Дніпропетровська', 'order': 7},
    {'name': 'Миколаїв', 'slug': 'mykolaiv', 'region': 'Миколаївська', 'order': 8},
    {'name': 'Маріуполь', 'slug': 'mariupol', 'region': 'Донецька', 'order': 9},
    {'name': 'Луганськ', 'slug': 'luhansk', 'region': 'Луганська', 'order': 10},
    {'name': 'Вінниця', 'slug': 'vinnytsia', 'region': 'Вінницька', 'order': 11},
    {'name': 'Севастополь', 'slug': 'sevastopol', 'region': 'АР Крим', 'order': 12},
    {'name': 'Сімферополь', 'slug': 'simferopol', 'region': 'АР Крим', 'order': 13},
    {'name': 'Чернігів', 'slug': 'chernihiv', 'region': 'Чернігівська', 'order': 14},
    {'name': 'Херсон', 'slug': 'kherson', 'region': 'Херсонська', 'order': 15},
    {'name': 'Полтава', 'slug': 'poltava', 'region': 'Полтавська', 'order': 16},
    {'name': 'Хмельницький', 'slug': 'khmelnytskyi', 'region': 'Хмельницька', 'order': 17},
    {'name': 'Черкаси', 'slug': 'cherkasy', 'region': 'Черкаська', 'order': 18},
    {'name': 'Чернівці', 'slug': 'chernivtsi', 'region': 'Чернівецька', 'order': 19},
    {'name': 'Житомир', 'slug': 'zhytomyr', 'region': 'Житомирська', 'order': 20},
    {'name': 'Суми', 'slug': 'sumy', 'region': 'Сумська', 'order': 21},
    {'name': 'Рівне', 'slug': 'rivne', 'region': 'Рівненська', 'order': 22},
    {'name': "Кам'янське", 'slug': 'kamianske', 'region': 'Дніпропетровська', 'order': 23},
    {'name': 'Кропивницький', 'slug': 'kropyvnytskyi', 'region': 'Кіровоградська', 'order': 24},
    {'name': 'Івано-Франківськ', 'slug': 'ivano-frankivsk', 'region': 'Івано-Франківська', 'order': 25},
    {'name': 'Тернопіль', 'slug': 'ternopil', 'region': 'Тернопільська', 'order': 26},
    {'name': 'Кременчук', 'slug': 'kremenchuk', 'region': 'Полтавська', 'order': 27},
    {'name': 'Луцьк', 'slug': 'lutsk', 'region': 'Волинська', 'order': 28},
    {'name': 'Біла Церква', 'slug': 'bila-tserkva', 'region': 'Київська', 'order': 29},
]


class Command(BaseCommand):
    help = 'Seed cities'

    def handle(self, *args, **options):
        created = 0

        for data in CITIES:
            _, was_created = City.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    'name': data['name'],
                    'region': data['region'],
                    'order': data['order'],
                    'is_active': True,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Cities: {created} created, {len(CITIES) - created} existing')
        )
