# AutoSchool Platform

Онлайн-платформа для автошколы: видео-обучение, тесты ПДД, онлайн-занятия с преподавателем, личный кабинет ученика, онлайн-оплата.

---

## Стек технологий

| Компонент | Технология |
|---|---|
| Backend | Python 3.12, Django 5.x, Django REST Framework |
| Async/WebSocket | django-channels, channels-redis |
| Task queue | Celery + Redis broker, django-celery-beat |
| Frontend | Next.js 14 (App Router), TypeScript (strict), Tailwind CSS + DaisyUI |
| State management | Zustand |
| БД | PostgreSQL 16 |
| Кеш/сессии | Redis 7 |
| Видео | FFmpeg → HLS, S3-совместимое хранилище + CDN |
| Оплата | LiqPay / Monobank API |
| Инфраструктура | Docker Compose, Nginx, SSL (Let's Encrypt) |
| WSGI/ASGI | Gunicorn + Uvicorn |
| CI/CD | GitHub Actions |

---

## Структура проекта

```
autoschool/
├── CLAUDE.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── Makefile                          # make up, make migrate, make test, make logs
│
├── backend/
│   ├── Dockerfile
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   ├── manage.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── core/                     # Базовые permissions, миксины, утилиты
│   │   ├── users/                    # User, UserDevice, UserSession, JWT auth
│   │   ├── courses/                  # Category, Course, Lesson, LessonProgress
│   │   ├── video/                    # Video, HLS, signed URLs, VideoAccessLog
│   │   ├── testing/                  # Question, Answer, Test, TestAttempt, импорт
│   │   ├── schedule/                 # TimeSlot, Booking, Zoom/Meet
│   │   ├── situations/              # Situation, SituationMedia, SituationComment
│   │   ├── payments/                 # Tariff, PromoCode, Payment, Subscription
│   │   ├── notifications/            # Notification, PushSubscription, preferences
│   │   ├── blog/                     # Article, ArticleTag
│   │   └── chat/                     # ChatRoom, Message (WebSocket)
│   └── locale/
│       └── uk/                       # Украинские переводы
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── public/
│   │   ├── manifest.json             # PWA
│   │   ├── sw.js                     # Service Worker
│   │   └── icons/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/             # Главная, about, pricing, blog, reviews, contacts
│   │   │   ├── (auth)/               # login, register, forgot-password
│   │   │   ├── (student)/            # dashboard, courses, tests, schedule, chat, payments, profile
│   │   │   ├── (teacher)/            # dashboard, schedule, students, materials, situations, chat
│   │   │   ├── (admin)/              # dashboard, content, tests, students, payments, tariffs, promo
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Button, Modal, Input, Card...
│   │   │   ├── layout/               # Header, Footer, Sidebar, Navigation
│   │   │   ├── video/                # HLSPlayer, VideoProgress
│   │   │   ├── testing/              # QuestionCard, Timer, ExamResults
│   │   │   ├── chat/                 # ChatWindow, MessageBubble
│   │   │   └── dashboard/            # ProgressChart, StatsCard
│   │   ├── lib/
│   │   │   ├── api.ts                # API client (axios) с JWT interceptors
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   └── utils.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── stores/                   # Zustand stores
│   │   ├── types/                    # TypeScript типы
│   │   └── i18n/                     # Переводы (next-intl)
│   └── next-i18next.config.js
│
└── nginx/
    ├── nginx.conf
    └── conf.d/
        └── default.conf
```

---

## Модели данных

### apps/users/

```python
class User(AbstractUser):
    phone                # CharField(max_length=20, unique=True)
    role                 # CharField(choices=['student','teacher','admin'], default='student')
    avatar               # ImageField(blank=True)
    language             # CharField(default='uk', max_length=5)
    is_phone_verified    # BooleanField(default=False)
    created_at           # DateTimeField(auto_now_add=True)

class UserDevice(Model):
    user                 # ForeignKey(User)
    device_id            # CharField — fingerprint устройства
    device_name          # CharField
    ip_address           # GenericIPAddressField
    city                 # CharField(blank=True)
    last_active          # DateTimeField(auto_now=True)
    is_active            # BooleanField(default=True)

class UserSession(Model):
    user                 # ForeignKey(User)
    device               # ForeignKey(UserDevice)
    session_key          # CharField
    ip_address           # GenericIPAddressField
    created_at           # DateTimeField(auto_now_add=True)
    expires_at           # DateTimeField
```

### apps/courses/

```python
class Category(Model):
    name, slug, order, parent  # parent = ForeignKey('self', null=True) — вложенные категории

class Course(Model):
    title, slug, description, category, thumbnail, is_published, order, created_at

class Lesson(Model):
    course, title, slug, description, order, duration_minutes, is_published
    materials            # JSONField — доп. материалы (текст, картинки)

class LessonProgress(Model):
    user, lesson         # unique_together
    is_completed         # BooleanField
    watch_percent        # PositiveIntegerField(0-100)
    last_position        # PositiveIntegerField — секунды
    completed_at         # DateTimeField(null=True)
```

### apps/video/

```python
class Video(Model):
    lesson               # OneToOneField(Lesson)
    original_file        # CharField — S3 path к оригиналу
    hls_path             # CharField — S3 path к HLS manifest
    duration             # PositiveIntegerField — секунды
    resolution           # CharField
    status               # CharField(choices=['uploading','processing','ready','error'])
    processed_at         # DateTimeField(null=True)

class VideoAccessLog(Model):
    user, video, ip_address, device, accessed_at
```

### apps/testing/

```python
class TestCategory(Model):
    name, slug

class Question(Model):
    category, text, image, explanation
    lesson               # ForeignKey(Lesson, null=True) — привязка к уроку

class Answer(Model):
    question             # ForeignKey(related_name='answers')
    text, is_correct

class Test(Model):
    title
    type                 # CharField(choices=['lesson','topic','exam'])
    lesson               # ForeignKey(null=True) — тест после урока
    category             # ForeignKey(null=True) — тест по теме
    questions_count      # default=20
    time_limit_minutes   # null = без лимита
    pass_percent         # default=80
    is_published

class TestAttempt(Model):
    user, test, started_at, finished_at, score, total, is_passed

class AttemptAnswer(Model):
    attempt, question, selected_answer, is_correct
```

### apps/schedule/

```python
class TimeSlot(Model):
    teacher              # ForeignKey(User)
    start_time, end_time # DateTimeField
    is_available         # BooleanField
    recurrence           # CharField(choices=['none','weekly'])

class Booking(Model):
    student              # ForeignKey(User)
    slot                 # OneToOneField(TimeSlot)
    status               # CharField(choices=['pending','confirmed','cancelled','completed'])
    meeting_url          # URLField — Zoom/Meet link
    recording_url        # CharField — запись занятия
    notes, created_at
```

### apps/situations/

```python
class Situation(Model):
    author, title, description, category, is_published, created_at

class SituationMedia(Model):
    situation            # ForeignKey(related_name='media')
    file                 # FileField
    media_type           # CharField(choices=['image','video','schema'])

class SituationComment(Model):
    situation, author, text, created_at
```

### apps/payments/

```python
class Tariff(Model):
    name, slug
    type                 # CharField(choices=['full','monthly'])
    price                # DecimalField
    currency             # default='UAH'
    duration_days        # срок доступа в днях
    description, is_active

class PromoCode(Model):
    code                 # CharField(unique=True)
    discount_percent     # PositiveIntegerField
    discount_amount      # DecimalField
    max_uses, used_count, valid_from, valid_until, is_active

class Payment(Model):
    user, tariff, promo_code
    amount, currency
    status               # CharField(choices=['pending','success','failed','refunded'])
    provider             # CharField(choices=['liqpay','monobank'])
    provider_payment_id  # CharField
    created_at, paid_at

class Subscription(Model):
    user, tariff, payment
    started_at, expires_at
    is_active            # BooleanField
    extended_by          # ForeignKey(User, null=True) — админ, который продлил
```

### apps/notifications/

```python
class Notification(Model):
    user
    type                 # CharField(choices=['email','push','system'])
    title, message
    data                 # JSONField — доп. данные (ссылки)
    is_read, created_at

class NotificationPreference(Model):
    user                 # OneToOneField
    email_lessons, email_payments, email_schedule  # BooleanField
    push_lessons, push_schedule                    # BooleanField

class PushSubscription(Model):
    user, endpoint, p256dh, auth, device
```

### apps/blog/

```python
class Article(Model):
    title, slug, content, excerpt, thumbnail, author
    is_published, published_at
    meta_title, meta_description  # SEO
    created_at

class ArticleTag(Model):
    name, slug
```

### apps/chat/

```python
class ChatRoom(Model):
    student, teacher     # unique_together
    created_at

class Message(Model):
    room, sender, text, file, is_read, created_at
```

---

## API Endpoints — /api/v1/

### Auth
```
POST   /auth/register/
POST   /auth/login/
POST   /auth/logout/
POST   /auth/refresh/
POST   /auth/password/reset/
POST   /auth/password/reset/confirm/
POST   /auth/verify-phone/
```

### Users
```
GET    /users/me/
PATCH  /users/me/
GET    /users/me/devices/
DELETE /users/me/devices/{id}/
GET    /users/me/progress/
```

### Courses & Lessons
```
GET    /courses/
GET    /courses/{id}/
GET    /courses/{id}/lessons/
GET    /courses/{id}/lessons/{id}/
POST   /courses/{id}/lessons/{id}/progress/
```

### Video
```
GET    /video/{id}/stream/                    # signed HLS URL
POST   /video/{id}/heartbeat/                 # tracking просмотра
```

### Testing
```
GET    /tests/
GET    /tests/{id}/
POST   /tests/{id}/start/
POST   /tests/attempts/{id}/answer/
POST   /tests/attempts/{id}/finish/
GET    /tests/attempts/                       # мои попытки
GET    /tests/stats/                          # статистика по темам
```

### Schedule
```
GET    /schedule/slots/                       # доступные слоты
POST   /schedule/bookings/
GET    /schedule/bookings/
PATCH  /schedule/bookings/{id}/
```

### Teacher
```
GET    /teacher/slots/
POST   /teacher/slots/
PATCH  /teacher/slots/{id}/
DELETE /teacher/slots/{id}/
```

### Situations
```
GET    /situations/
GET    /situations/{id}/
POST   /situations/                           # teacher only
POST   /situations/{id}/comments/
```

### Payments
```
GET    /payments/tariffs/
POST   /payments/create/
POST   /payments/callback/liqpay/             # webhook
POST   /payments/callback/monobank/           # webhook
GET    /payments/history/
POST   /payments/promo/validate/
GET    /payments/subscription/
```

### Blog
```
GET    /blog/articles/
GET    /blog/articles/{slug}/
```

### Chat
```
GET    /chat/rooms/
GET    /chat/rooms/{id}/messages/
POST   /chat/rooms/{id}/messages/
WS     ws://host/ws/chat/{room_id}/           # WebSocket
```

### Notifications
```
GET    /notifications/
PATCH  /notifications/{id}/read/
POST   /notifications/push/subscribe/
GET    /notifications/preferences/
PATCH  /notifications/preferences/
```

### Admin
```
GET    /admin/stats/dashboard/
GET    /admin/students/
POST   /admin/students/{id}/extend/           # продлить подписку
POST   /admin/content/video/upload/
POST   /admin/tests/import/                   # CSV/Excel
GET    /admin/payments/
```

---

## Безопасность

### Аутентификация
- JWT: access token (15 мин) + refresh token (7 дней)
- Токены хранятся в **httpOnly cookies** (не localStorage)
- CSRF protection для cookie-based auth
- Refresh token rotation — при обновлении старый инвалидируется

### Защита от передачи доступа
- Максимум **2 устройства** на аккаунт одновременно
- При входе с 3-го устройства — автоматическая деактивация самой старой сессии
- Логирование IP-адресов и геолокации при каждом входе
- Детекция подозрительной активности: вход из разных городов одновременно → временная блокировка
- Уведомление ученику при входе с нового устройства

### Защита видеоконтента
- HLS-стриминг — видео разбивается на зашифрованные фрагменты
- **Signed URLs**: TTL 2 часа, привязка к user_id + IP
- Доступ только для авторизованных пользователей с активной подпиской
- Запрет скачивания в плеере (отключение контекстного меню, кастомные controls)
- VideoAccessLog — логирование всех обращений к видео

### Защита API
- **Rate limiting** на все эндпоинты (django-ratelimit):
  - Auth: 5 запросов/мин
  - API общее: 60 запросов/мин
  - Video stream: 10 запросов/мин
  - Payment callbacks: по IP провайдера
- **CORS**: только домен фронтенда, никаких wildcard
- Input sanitization на бэкенде (все данные через serializers)
- **Никакого raw SQL** — только ORM (защита от SQL injection)
- XSS: React автоэкранирование + DOMPurify для user-generated content (комментарии, чат)
- File upload: валидация MIME-типа + максимальный размер (видео 2GB, изображения 10MB, документы 50MB)

### Защита платежей
- Webhook верификация: проверка подписи LiqPay/Monobank
- Идемпотентность: дублирование webhook не создаёт повторную оплату
- Все суммы хранятся в DecimalField (не float)
- Логирование всех платёжных операций

### Защита от брутфорса
- Блокировка аккаунта после 5 неудачных попыток входа на 15 минут
- CAPTCHA (hCaptcha — бесплатный, GDPR-friendly) на: регистрации, восстановлении пароля, после 3 неудачных логинов
- Rate limit на /auth/ эндпоинты: 5 запросов/мин на IP

### Общее
- Django SECRET_KEY, DB пароли, API ключи — только через переменные окружения (.env)
- DEBUG=False в проде
- ALLOWED_HOSTS строго ограничен
- HTTPS everywhere (SSL через Let's Encrypt + Nginx)
- Security headers: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy
- Content-Security-Policy: ограничить источники скриптов, стилей, медиа
- Пароли: Django PBKDF2 (минимум 8 символов, валидация сложности)
- Защита от clickjacking: X-Frame-Options DENY (кроме видео-плеера если нужен embed)

---

## Оптимизация

### Backend
- **select_related / prefetch_related** обязательно во всех запросах — никаких N+1
- Redis кеш для тяжёлых запросов:
  - Список курсов — TTL 5 мин
  - Активные тарифы — TTL 10 мин
  - Статьи блога — TTL 5 мин
  - Прогресс ученика — TTL 1 мин
  - Категории тестов — TTL 30 мин
- Пагинация: CursorPagination для списков (быстрее offset), PageNumberPagination для админки
- Индексы БД на часто используемых полях (slug, user_id, created_at, is_published)
- Celery для всех тяжёлых операций (видео, email, push, импорт)

### Frontend
- **Серверные компоненты** по умолчанию, `'use client'` только для интерактивности
- ISR (Incremental Static Regeneration) для публичных страниц: blog, pricing, about
- SSR для динамических страниц: dashboard, courses, tests
- **next/image** для всех изображений (автоматическая оптимизация, WebP, lazy loading)
- Dynamic imports для тяжёлых компонентов:
  - `dynamic(() => import('./HLSPlayer'))` — видео-плеер
  - `dynamic(() => import('./ChatWindow'))` — чат
  - `dynamic(() => import('./ExamMode'))` — режим экзамена
- Bundle splitting по route groups

### Видео
- HLS adaptive bitrate: 360p, 720p, 1080p
- FFmpeg пресеты оптимизированы под web
- CDN для раздачи HLS-сегментов
- Предзагрузка следующего сегмента в плеере

### PWA
- Service Worker кеширует статику и API-ответы
- Offline fallback страница
- Background sync для отправки ответов тестов при восстановлении связи

### Инфраструктура
- Nginx: gzip сжатие, кеширование статики, proxy buffering
- PostgreSQL: connection pooling (pgbouncer при росте нагрузки)
- Docker multi-stage builds для минимального размера образов

### Мониторинг ресурсов сервера
Стартовый VPS: 1 ядро, 2 GB RAM + 2 GB swap. Это минимальная конфигурация.

**Обязательно при реализации:**
- Если задача может привести к нехватке ресурсов (FFmpeg конвертация, npm run build, большой импорт данных, одновременный запуск всех сервисов) — **сообщать пользователю** и предлагать решение
- При написании Celery задач учитывать ограничения RAM: FFmpeg с лимитом памяти, один concurrent worker для тяжёлых задач
- Gunicorn: **2 workers** (не 3+), чтобы уложиться в RAM
- Next.js: билдить локально/в CI, на VPS деплоить собранный вариант (`npm start`, не `npm run build`)
- PostgreSQL: `shared_buffers=256MB`, `work_mem=4MB` — экономные настройки
- Redis: `maxmemory 128mb` + `maxmemory-policy allkeys-lru`
- Swap 2 GB обязателен как страховка

**Когда рекомендовать апгрейд до VPS 4G (4 ядра, 4 GB RAM):**
- Больше 50 активных пользователей одновременно
- Частая конвертация видео (>3 видео в день)
- OOM-ошибки в логах Docker
- Время ответа API стабильно >500ms

---

## КРИТИЧЕСКИЕ ПРАВИЛА (НИКОГДА НЕ НАРУШАТЬ)

1. **НИКОГДА не удалять базу данных** — ни `DROP DATABASE`, ни `docker volume rm postgres_data`, ни `flush`, ни `migrate --run-syncdb` с нуля. Потеря данных = потеря денег клиентов и юридические проблемы.
2. **НИКОГДА не запускать `docker compose down -v`** — флаг `-v` удаляет volumes (базу данных, Redis). Только `docker compose down` без `-v`.
3. **НИКОГДА не выполнять `python manage.py flush`** — это очищает все таблицы.
4. **НИКОГДА не удалять миграции** которые уже применены — ни файлы миграций, ни записи из `django_migrations`.
5. **НИКОГДА не выполнять `DROP TABLE`, `TRUNCATE`, `DELETE FROM` без WHERE** на продакшн данных.
6. **НИКОГДА не делать `git push --force` в main или develop**.
7. **НИКОГДА не хранить секреты в коде** — только .env.
8. **Перед любой деструктивной операцией** (удаление файлов, очистка данных, сброс миграций) — **спросить пользователя** и объяснить последствия.

Если нужно пересоздать БД в dev — сначала спросить. Если нужно сбросить данные — предложить `pg_dump` бэкап ПЕРЕД операцией. В проде деструктивные операции с данными ЗАПРЕЩЕНЫ без явного письменного подтверждения.

### Стиль кода — писать как человек
- **Никаких эмодзи в коде** — ни в комментариях, ни в строках, ни в коммитах, ни в toast-сообщениях, ни в UI-текстах. Исключение: если клиент явно попросит.
- **Не писать шаблонные AI-комментарии**: никаких "This function handles...", "Below we define...", "Let's create...". Комментарий только если логика реально неочевидна — и тогда коротко, по делу.
- **Имена переменных и функций — естественные**, как написал бы опытный разработчик: `get_active_subscription`, не `retrieve_current_user_active_subscription_instance`.
- **Не перебарщивать с абстракциями** — если код используется один раз, не выносить в отдельную утилиту "на будущее".
- **Комментарии на английском**, UI-тексты на украинском (i18n).
- **Коммиты**: краткие, по делу — `feat: add payment webhook handler`, не `feat: implement a comprehensive payment webhook handling system with full validation`.
- **Не добавлять избыточные docstring** к очевидным методам. `def get_user(self, user_id)` не нуждается в пояснении.
- **Разнообразие в коде** — не повторять одинаковые паттерны механически. Если 5 views — каждый может немного отличаться по стилю, как в реальном проекте с одним разработчиком.

---

## Качество и надёжность (коммерческий проект)

### Обработка ошибок

**Backend:**
- Глобальный exception handler в DRF (`EXCEPTION_HANDLER` в settings) — все ошибки возвращаются в едином формате:
  ```json
  {"error": "code", "message": "Человекочитаемое сообщение", "details": {}}
  ```
- Никогда не показывать stack trace пользователю — только в логах
- Все внешние вызовы (LiqPay, Monobank, S3, Zoom) оборачивать в try/except с логированием и fallback
- Celery задачи: `autoretry_for`, `max_retries=3`, `retry_backoff=True` для сетевых ошибок
- Кастомные exception классы для бизнес-ошибок: `SubscriptionExpired`, `DeviceLimitReached`, `PaymentFailed`

**Frontend:**
- Глобальный Error Boundary на уровне layout — при краше показывать "Щось пішло не так" с кнопкой перезагрузки, не белый экран
- API клиент: единый interceptor для 401 (refresh token), 403 (редирект на оплату), 500 (toast с ошибкой)
- Формы: показывать серверные ошибки валидации при каждом поле
- Loading/error/empty states для каждого компонента с данными — никаких undefined crashes

### Логирование

- Использовать Python `logging` с structured JSON format (не print!)
- Уровни:
  - `ERROR` — необработанные исключения, ошибки оплаты, падение Celery задач
  - `WARNING` — подозрительная активность (мультигео), неудачные попытки входа, retry задач
  - `INFO` — успешная оплата, регистрация, важные бизнес-события
  - `DEBUG` — детали запросов (только dev)
- Каждая запись содержит: `timestamp`, `user_id`, `request_id`, `action`, `ip`
- Логи пишутся в файл + stdout (для Docker logs)
- Ротация логов: 7 дней хранения, максимум 500 MB
- **Никогда не логировать**: пароли, токены, номера карт, персональные данные (GDPR)

### Тестирование

**Обязательно покрывать тестами:**
- Все API endpoints — happy path + основные ошибки (401, 403, 404, 422)
- Бизнес-логика в services.py — каждый метод
- Платёжные webhooks — корректная обработка + дубли + невалидная подпись
- Permissions — студент не может в админку, гость не видит курсы
- Подписки — активация, истечение, продление
- Лимит устройств — 3-е устройство деактивирует 1-е

**Не обязательно тестировать:**
- Простые CRUD без бизнес-логики
- Django admin
- Статические страницы фронтенда

**Инструменты:** pytest + factory_boy + pytest-django. Фикстуры: conftest.py в каждом app.
**Запуск:** `make test` перед каждым PR в develop.

### Миграции БД

- **Никогда не менять миграции, которые уже применены на проде** — только новые
- Опасные операции (удаление колонки, переименование таблицы) — в 2 этапа:
  1. Добавить новое + скопировать данные
  2. В следующем релизе удалить старое
- `AddField` с `null=True` или `default=` — безопасно
- `RemoveField` — сначала убрать из кода, потом миграция
- Перед деплоем: `python manage.py migrate --plan` — проверить что будет применено
- Большие data-миграции — через Celery задачу, не в миграции Django
- **Бэкап БД перед каждой миграцией на проде**

### Транзакции

- `@transaction.atomic` обязателен для:
  - Создание оплаты + активация подписки
  - Регистрация пользователя + создание профиля
  - Завершение теста + подсчёт результатов
  - Любая операция, затрагивающая 2+ таблицы
- `select_for_update()` при обновлении балансов, счётчиков использования промокодов
- Webhook оплаты: идемпотентность через `provider_payment_id` unique constraint

### Бэкапы

- PostgreSQL: `pg_dump` ежедневно в 03:00 через cron
- Хранение: S3 бакет (отдельный от видео), ротация 30 дней
- S3 медиа: версионирование включено на уровне бакета
- **Тестировать восстановление** из бэкапа раз в месяц
- Перед деструктивными миграциями — ручной бэкап

### Деплой

- **Zero-downtime:** Docker Compose `--no-deps --build backend && restart` по одному сервису
- Порядок деплоя: миграции → backend → celery → frontend → nginx reload
- Откат: `docker compose up -d --force-recreate` с предыдущим образом
- Хранить последние 3 Docker-образа для быстрого rollback
- `health check` в Docker Compose для каждого сервиса
- CI/CD pipeline: lint → test → build → deploy (deploy только из main)
- **Staging окружение не нужно на старте** — тестируем локально в Docker, деплоим на VPS

### API контракты

- Версионирование: `/api/v1/` — менять мажорную версию при breaking changes
- Никогда не удалять поля из ответа API без bump версии
- Добавление полей — обратно совместимо, не требует новой версии
- Формат ошибок единый (см. Обработка ошибок)
- Пагинация: всегда возвращать `count`, `next`, `previous`
- Даты: ISO 8601 (`2026-03-18T14:30:00Z`), timezone-aware
- Деньги: строка `"150.00"` (не float), всегда с валютой

### Мониторинг

**На старте (бесплатно):**
- Docker health checks — автоматический перезапуск упавших контейнеров
- `docker stats` / `docker logs` — ручная проверка
- Celery Flower (web UI) — мониторинг очередей и задач
- Django management command `check_health` — проверка БД, Redis, S3, свободного места
- Cron: запуск `check_health` каждые 5 мин, при ошибке — email админу

**При росте (платно):**
- Sentry (бесплатный план) — отлов ошибок backend + frontend
- UptimeRobot (бесплатно) — пинг сайта каждые 5 мин, алерт в Telegram

**Алерты (отправлять в Telegram бот):**
- Сервис упал (health check failed)
- Ошибка оплаты
- Диск заполнен >80%
- RAM >90%
- Celery очередь >100 задач в ожидании

---

## UI/UX и дизайн

### Принципы
- **Целевая аудитория — люди 16-55 лет**, многие не IT-специалисты. Интерфейс должен быть понятен без инструкции.
- Каждое действие пользователя — очевидный результат. Нажал "Оплатить" → видит что происходит, не гадает.
- Минимум кликов до цели: регистрация → оплата → первый урок — максимум 4-5 шагов.

### DaisyUI тема и стилистика
- Основная тема: `light` (светлая), с поддержкой `dark` через toggle
- Цветовая схема: DaisyUI semantic colors (`primary`, `secondary`, `accent`, `success`, `warning`, `error`)
- `primary` — основные кнопки и акценты (CTA: "Почати навчання", "Оплатити")
- `success` — пройдено, завершено, оплачено
- `warning` — внимание, срок истекает, незавершённое
- `error` — ошибки, блокировки, неправильные ответы
- Шрифт: системный стек (`font-sans` в Tailwind) — быстрая загрузка, привычный вид
- Скругления: `rounded-lg` для карточек, `rounded-btn` для кнопок (DaisyUI default)
- Тени: `shadow-md` для карточек контента, `shadow-lg` для модалок

### Подсказки и onboarding
- **Tooltip** (`DaisyUI tooltip`) на каждой неочевидной кнопке/иконке
- **Первый вход ученика** — пошаговый onboarding (3-4 шага):
  1. "Ось ваш кабінет — тут ваш прогрес"
  2. "Починайте з першого уроку"
  3. "Після уроку — пройдіть тест"
  4. "Залишились питання? Напишіть викладачу в чат"
- **Empty states** — когда списки пустые, не показывать голую страницу, а текст с действием:
  - Нет курсов: "Ви ще не придбали курс. Оберіть тариф →"
  - Нет тестов: "Пройдіть перший урок, щоб відкрити тест"
  - Нет сообщений: "Напишіть викладачу, щоб задати питання"
- **Placeholder текст в полях** — подсказка формата: "Введіть email, наприклад: student@gmail.com", "+380 XX XXX XX XX"
- **Inline validation** — ошибки под полем сразу при вводе, не после submit:
  - "Email вже зареєстрований"
  - "Пароль має містити мінімум 8 символів"
  - "Невірний формат номеру телефону"

### Обратная связь на действия (feedback)
- **Кнопки:** при нажатии — `loading` состояние (спиннер внутри кнопки DaisyUI `btn loading`), кнопка заблокирована от повторного клика
- **Успешные действия:** toast уведомление (зелёный, сверху справа, автоскрытие 3 сек):
  - "Урок завершено ✓"
  - "Оплата пройшла успішно ✓"
  - "Відповідь збережено ✓"
- **Ошибки:** toast (красный, без автоскрытия — закрывается вручную):
  - "Помилка оплати. Спробуйте ще раз"
  - "Не вдалося завантажити відео. Перевірте з'єднання"
- **Прогресс:** progress bar или skeleton при загрузке данных, никаких пустых экранов
- **Подтверждение опасных действий:** модальное окно для: отмена бронирования, удаление аккаунта, отвязка устройства

### Навигация
- **Sidebar** (desktop) + **Bottom navigation** (mobile) — основные разделы всегда доступны
- Breadcrumbs на внутренних страницах: Курси → Основи ПДР → Урок 3
- Текущий раздел выделен в навигации (`active` состояние)
- Кнопка "Назад" где это логично (страница урока → назад к курсу)

### Адаптивность (ПРИОРИТЕТ — большинство учеников с телефона)

**Mobile-first обязательно:** ВСЕ компоненты сначала верстаются под мобильный (320-428px), потом расширяются. Не наоборот.

**Breakpoints (Tailwind):**
- По умолчанию — мобильный (без префикса)
- `sm:` (640px) — большие телефоны / маленькие планшеты
- `md:` (768px) — планшеты
- `lg:` (1024px) — десктоп
- `xl:` (1280px) — широкий десктоп (админка)

**Видео-плеер (ключевой компонент):**
- Мобильный: полная ширина экрана, поддержка fullscreen, landscape-ориентация
- Управление: крупные кнопки play/pause/fullscreen (минимум 48x48px), жест свайп для перемотки
- Автоматический выбор качества по скорости соединения (360p на 3G, 720p на 4G/Wi-Fi)
- Запоминание позиции просмотра — продолжить с того же места при возвращении
- Picture-in-Picture поддержка — ученик может читать материалы и смотреть видео одновременно

**Тесты:**
- Мобильный: 1 вопрос на экран, свайп или кнопка "Далі" для перехода
- Варианты ответа: крупные карточки на всю ширину (легко нажать пальцем, не промахнуться)
- Таймер: фиксирован сверху, всегда виден при скролле (`sticky top-0`)
- Навигация по вопросам: горизонтальный скролл с номерами (зелёный — отвечено, серый — нет)
- Десктоп: вопрос по центру, навигация по вопросам в sidebar справа

**Навигация:**
- Мобильный: Bottom tab bar (фиксирован снизу) — Головна, Курси, Тести, Чат, Профіль
- Планшет/десктоп: Sidebar слева
- Hamburger-меню НЕ использовать для основной навигации — важные разделы всегда видны

**Формы:**
- Инпуты: высота минимум 48px, шрифт 16px (предотвращает автозум на iOS)
- Кнопка submit: на всю ширину на мобильном (`w-full`), фиксированная снизу при длинных формах
- Авторизация по телефону: `inputmode="tel"`, маска ввода +380
- Email: `inputmode="email"`, автозаполнение `autocomplete="email"`

**Карточки курсов/уроков:**
- Мобильный: список в 1 колонку, крупные превью
- Планшет: 2 колонки
- Десктоп: 3-4 колонки grid

**Текст и читаемость:**
- Базовый размер: 16px (1rem), не меньше 14px нигде
- Межстрочный интервал: `leading-relaxed` (1.625) для длинных текстов (материалы уроков, статьи блога)
- Максимальная ширина текстового блока: `max-w-prose` (65ch) — комфортное чтение

**Оффлайн и нестабильный интернет (PWA):**
- Кеширование пройденных тестов и результатов — доступны без интернета
- Сохранение ответов теста при потере связи — отправка при восстановлении (Background Sync)
- Индикатор "Немає з'єднання" (banner сверху), не ломать интерфейс
- Скачанные материалы уроков (текст, изображения) доступны оффлайн

**Тестирование адаптивности:**
- Проверять на реальных разрешениях: iPhone SE (375px), iPhone 14 (390px), Samsung Galaxy (360px), iPad (768px)
- Chrome DevTools responsive mode при разработке
- Touch-события: убедиться что hover-эффекты не блокируют работу на touch-устройствах (используем `@media (hover: hover)` для hover-стилей)

### Доступность (a11y)
- `aria-label` на кнопках-иконках (без текста)
- Контраст текста: минимум 4.5:1 (WCAG AA)
- Фокус видим при навигации клавиатурой (`focus-visible` стили)
- `alt` текст на всех изображениях
- Формы: `<label>` связан с каждым `<input>` через `htmlFor`

### Компоненты с состояниями
Каждый компонент, загружающий данные, имеет 4 состояния:
1. **Loading** — skeleton placeholder (DaisyUI `skeleton`) или спиннер
2. **Success** — данные отображены
3. **Empty** — пустой список с подсказкой и CTA
4. **Error** — сообщение об ошибке с кнопкой "Спробувати знову"

---

## Правила кода

### Размер файлов и модульность
- **Максимум ~300 строк на файл.** Если файл растёт больше — разбивать на модули.
- Backend: `models.py` можно разбить на `models/user.py`, `models/subscription.py` и т.д. с `__init__.py` для реэкспорта.
- Backend: `views.py` → `views/auth.py`, `views/courses.py` если views много.
- Backend: `services.py` → `services/payment.py`, `services/subscription.py` если логика сложная.
- Frontend: один компонент = один файл. Компонент >200 строк — разбить на подкомпоненты.
- Frontend: утилиты группировать по домену: `lib/auth.ts`, `lib/payment.ts`, не сваливать всё в один `utils.ts`.
- Исключение: `settings/base.py`, конфиги, миграции — могут быть длиннее, это нормально.

### Backend — Django

- Каждое app содержит: `models.py`, `serializers.py`, `views.py`, `urls.py`, `permissions.py`, `services.py`, `tasks.py` (при необходимости), `signals.py` (при необходимости), `admin.py`
- **Бизнес-логика в `services.py`**, не в views и не в serializers
- **Валидация в `serializers.py`**, не в views
- ViewSet + Router для CRUD, APIView для кастомных эндпоинтов
- Все API под `/api/v1/` prefix
- Фильтрация через django-filter
- Кастомные permissions в `permissions.py` каждого app: `IsStudent`, `IsTeacher`, `IsAdmin`, `IsSubscriptionActive`
- Все пользовательские строки через `gettext_lazy()` для i18n
- Тесты: pytest + factory_boy, покрытие API-тестами

### Frontend — Next.js

- **TypeScript strict mode** — никаких `any`
- Серверные компоненты по умолчанию, `'use client'` только где нужна интерактивность
- API вызовы через единый клиент (`src/lib/api.ts`) с interceptors для JWT
- Формы: `react-hook-form` + `zod` для валидации
- State management: **Zustand** (не Redux, не Context для глобального состояния)
- Стили: **только Tailwind + DaisyUI** классы, никаких отдельных CSS файлов
- Компоненты: маленькие, переиспользуемые, в `components/{domain}/`
- Иконки UI: **Lucide React** (`lucide-react`) — для интерфейсных элементов (навигация, кнопки, формы). Tree-shaking из коробки — `import { Play, Clock } from 'lucide-react'`. Не использовать другие библиотеки (heroicons, react-icons)
- Иконки тематические: кастомные SVG в `public/icons/auto/` и как React-компоненты в `components/icons/`. Тематика автошколы: автомобиль, руль, дорожные знаки, светофор, перекрёсток, водительское удостоверение, конус. Стиль — outline, одноцветные, совместимые визуально с Lucide (stroke-width: 2, 24x24)
- SEO: `generateMetadata()` в серверных компонентах

### Git
- Ветки: `main` (прод), `develop` (разработка), `feature/*`, `fix/*`, `hotfix/*`
- Коммиты: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`
- PR из feature → develop, затем develop → main для релиза

---

## Docker Compose

```yaml
# docker-compose.yml (dev)
services:
  db:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    env_file: .env

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes: [./backend:/app]
    env_file: .env
    depends_on: [db, redis]
    ports: ["8000:8000"]

  celery_worker:
    build: ./backend
    command: celery -A config worker -l info -Q default,video,notifications,payments
    env_file: .env
    depends_on: [db, redis]

  celery_beat:
    build: ./backend
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file: .env
    depends_on: [db, redis]

  frontend:
    build: ./frontend
    command: npm run dev
    volumes: [./frontend:/app, /app/node_modules]
    ports: ["3000:3000"]
    env_file: .env
```

```yaml
# docker-compose.prod.yml (дополнение)
services:
  backend:
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3

  backend_asgi:
    build: ./backend
    command: uvicorn config.asgi:application --host 0.0.0.0 --port 8001
    env_file: .env
    depends_on: [db, redis]

  frontend:
    command: npm start

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - static_files:/app/static
      - certbot_certs:/etc/letsencrypt
    ports: ["80:80", "443:443"]
    depends_on: [backend, backend_asgi, frontend]
```

---

## Celery задачи

### Очередь: video
- `process_uploaded_video(video_id)` — FFmpeg конвертация в HLS (360p, 720p, 1080p), загрузка в S3
- `generate_video_thumbnail(video_id)` — генерация превью

### Очередь: notifications
- `send_email_notification(user_id, template, context)` — отправка email
- `send_push_notification(user_id, title, body, data)` — PWA push
- `send_booking_reminder(booking_id)` — напоминание за 1 час до занятия
- `send_expiry_warning(subscription_id)` — предупреждение за 3 дня до истечения

### Очередь: payments
- `process_payment_callback(provider, data)` — обработка webhook оплаты
- `check_expired_subscriptions()` — periodic, каждые 30 мин
- `deactivate_expired_subscriptions()` — periodic, ежедневно 00:00

### Очередь: default
- `import_questions_from_file(file_path, format)` — парсинг CSV/Excel
- `cleanup_old_sessions()` — periodic, ежедневно
- `detect_suspicious_sessions(user_id)` — проверка мультигео входов
- `generate_daily_stats()` — periodic, ежедневно
- `invalidate_user_progress(user_id)` — при деактивации подписки

---

## Redis

```
# Кеш (django-redis, prefix: cache:)
cache:courses:list                     # TTL 5 мин
cache:tariffs:active                   # TTL 10 мин
cache:blog:articles:list               # TTL 5 мин
cache:user:{id}:progress               # TTL 1 мин
cache:tests:categories                 # TTL 30 мин

# Сессии
session:{session_key}

# Celery broker
celery

# Rate limiting
ratelimit:{ip}:{endpoint}

# Видео signed URL кеш
video:signed:{video_id}:{user_id}      # TTL = срок подписи (2ч)

# Онлайн-статус (чат)
online:{user_id}                       # TTL 5 мин, heartbeat

# Активные сессии
user_sessions:{user_id}                # SET device_ids — контроль лимита
```

---

## Зависимости

### Backend (requirements/base.txt)
```
django>=5.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
django-filter
django-redis
django-celery-beat
django-storages[boto3]
django-channels
channels-redis
django-ratelimit
celery[redis]
psycopg[binary]
Pillow
boto3
openpyxl
gunicorn
uvicorn[standard]
whitenoise
python-dotenv
```

### Backend (requirements/dev.txt)
```
-r base.txt
pytest
pytest-django
factory-boy
django-debug-toolbar
ipython
```

### Frontend (package.json)
```
next, react, react-dom, typescript
tailwindcss, daisyui, postcss, autoprefixer
zustand
axios
react-hook-form, @hookform/resolvers, zod
hls.js
next-intl
next-pwa (или @ducanh2912/next-pwa)
date-fns
dompurify
```

---

## SEO (для публичной части и блога)

- Каждая публичная страница: уникальный `<title>`, `<meta description>`, Open Graph теги
- `generateMetadata()` в Next.js серверных компонентах — динамические мета для статей блога
- Структурированные данные (JSON-LD): Organization, Course, Article, FAQ, BreadcrumbList
- `sitemap.xml` — автогенерация через Next.js (next-sitemap)
- `robots.txt` — закрыть от индексации: /dashboard, /admin, /api, /auth
- Канонические URL (`<link rel="canonical">`) на каждой странице
- Семантическая разметка: `<h1>` один на страницу, правильная иерархия заголовков
- Изображения: `alt` текст, WebP формат, lazy loading
- Скорость загрузки: целевой Core Web Vitals — LCP <2.5s, FID <100ms, CLS <0.1
- Статьи блога: ЧПУ slug (`/blog/pravyla-proizdu-perekhrest`), дата публикации, автор

---

## .env переменные (шаблон)

```
# Django
DJANGO_SECRET_KEY=
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=domain.com,www.domain.com
DJANGO_SETTINGS_MODULE=config.settings.prod

# Database
POSTGRES_DB=autoschool
POSTGRES_USER=autoschool
POSTGRES_PASSWORD=
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://redis:7/0

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15        # минуты
JWT_REFRESH_TOKEN_LIFETIME=10080    # 7 дней в минутах

# S3 Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_ENDPOINT_URL=
AWS_S3_CUSTOM_DOMAIN=               # CDN домен

# Payments
LIQPAY_PUBLIC_KEY=
LIQPAY_PRIVATE_KEY=
MONOBANK_TOKEN=

# Email
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=1
DEFAULT_FROM_EMAIL=noreply@domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://domain.com/ws

# VAPID keys (PWA push)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_ADMIN_EMAIL=admin@domain.com

# Zoom (if used)
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# hCaptcha
HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
```

---

## Фазы разработки

1. **Фундамент** — Docker Compose, Django project, Next.js project, JWT auth, users app, базовый layout, CI
2. **Контент и видео** — courses, video, FFmpeg HLS конвертация, S3, CDN, HLS плеер, прогресс
3. **Тестирование** — тесты ПДД, билеты, режим "Экзамен" с таймером, статистика, импорт CSV/Excel
4. **Оплата** — LiqPay/Monobank интеграция, тарифы, промокоды, подписки, webhooks
5. **Расписание и чат** — слоты преподавателя, бронирование, Zoom/Meet, WebSocket чат
6. **Разборы и блог** — ситуации с медиа, комментарии, статьи блога, SEO
7. **Уведомления и защита** — email, PWA push, лимит сессий, привязка устройств, детекция аномалий
8. **Админка и кабинеты** — кабинет преподавателя, админ-панель, дашборды, статистика
9. **PWA, i18n, полировка** — manifest, service worker, украинский язык, тесты, оптимизация
