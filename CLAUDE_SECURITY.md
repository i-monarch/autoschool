# Security & Quality Guidelines

> Этот файл — справочник. Основные правила в CLAUDE.md.

---

## Аутентификация
- JWT: access token (15 мин) + refresh token (7 дней)
- Токены в **httpOnly cookies** (не localStorage)
- CSRF protection для cookie-based auth
- Refresh token rotation — старый инвалидируется

## Защита от передачи доступа
- Максимум **2 устройства** на аккаунт
- 3-е устройство — деактивация самой старой сессии
- Логирование IP + геолокации при входе
- Детекция мультигео → временная блокировка
- Уведомление при входе с нового устройства

## Защита видеоконтента
- HLS-стриминг, зашифрованные фрагменты
- Signed URLs: TTL 2ч, привязка к user_id + IP
- Доступ только с активной подпиской
- VideoAccessLog — логирование обращений

## Защита API
- Rate limiting (django-ratelimit): Auth 5/мин, API 60/мин, Video 10/мин
- CORS: только домен фронтенда
- Только ORM, никакого raw SQL
- XSS: React + DOMPurify для UGC
- File upload: валидация MIME, лимиты (видео 2GB, изображения 10MB, документы 50MB)

## Защита платежей
- Webhook: проверка подписи LiqPay/Monobank
- Идемпотентность через `provider_payment_id` unique constraint
- Суммы в DecimalField (не float)
- Логирование всех операций

## Защита от брутфорса
- Блокировка после 5 неудачных попыток на 15 мин
- hCaptcha на регистрации, восстановлении пароля, после 3 неудачных логинов

## Security headers
- X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, CSP
- Django SECRET_KEY, пароли, ключи — только .env
- DEBUG=False в проде, ALLOWED_HOSTS строго ограничен

---

## Обработка ошибок

**Backend:**
- Глобальный exception handler в DRF, единый формат: `{"error": "code", "message": "...", "details": {}}`
- Stack trace только в логах, не пользователю
- Внешние вызовы (LiqPay, S3, Zoom) — try/except с логированием
- Celery: `autoretry_for`, `max_retries=3`, `retry_backoff=True`
- Кастомные exceptions: `SubscriptionExpired`, `DeviceLimitReached`, `PaymentFailed`

**Frontend:**
- Error Boundary на уровне layout
- API interceptor: 401 → refresh, 403 → редирект на оплату, 500 → toast
- Loading/error/empty states для каждого компонента

## Логирование
- Python `logging` с structured JSON (не print)
- ERROR/WARNING/INFO/DEBUG уровни
- Каждая запись: `timestamp`, `user_id`, `request_id`, `action`, `ip`
- Ротация: 7 дней, макс 500 MB
- Никогда не логировать: пароли, токены, номера карт

## Тестирование

**Покрывать тестами:**
- API endpoints — happy path + ошибки (401, 403, 404, 422)
- Бизнес-логика в services.py
- Платежные webhooks (корректная обработка + дубли + невалидная подпись)
- Permissions, подписки, лимит устройств

**Не обязательно:** простые CRUD, Django admin, статические страницы.

**Инструменты:** pytest + factory_boy + pytest-django

## Миграции БД
- Не менять примененные миграции — только новые
- Опасные операции (удаление колонки) — в 2 этапа
- `RemoveField` — сначала убрать из кода, потом миграция
- `migrate --plan` перед деплоем
- Бэкап БД перед миграцией на проде

## Транзакции
- `@transaction.atomic` для операций с 2+ таблицами (оплата+подписка, регистрация+профиль, тест+результаты)
- `select_for_update()` для счетчиков и балансов

## Бэкапы
- `pg_dump` ежедневно 03:00 → S3 (отдельный бакет), ротация 30 дней
- Тестировать восстановление раз в месяц

## Деплой
- Zero-downtime: по одному сервису
- Порядок: миграции → backend → celery → frontend → nginx reload
- Health check в Docker Compose
- CI/CD: lint → test → build → deploy (только из main)

## API контракты
- `/api/v1/`, bump при breaking changes
- Не удалять поля без новой версии
- Пагинация: `count`, `next`, `previous`
- Даты: ISO 8601, timezone-aware
- Деньги: строка "150.00" с валютой
