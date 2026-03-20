# Infrastructure & Optimization

> Этот файл — справочник. Основные правила в CLAUDE.md.

---

## Оптимизация Backend
- `select_related` / `prefetch_related` обязательно — никаких N+1
- Redis кеш: курсы 5мин, тарифы 10мин, блог 5мин, прогресс 1мин, категории тестов 30мин
- CursorPagination для списков, PageNumberPagination для админки
- Индексы на slug, user_id, created_at, is_published
- Celery для тяжелых операций

## Оптимизация Frontend
- Серверные компоненты по умолчанию, `'use client'` только для интерактивности
- ISR для публичных страниц, SSR для динамических
- `next/image` для всех изображений
- Dynamic imports: HLSPlayer, ChatWindow, ExamMode
- Bundle splitting по route groups

## Видео
- HLS adaptive bitrate: 360p, 720p, 1080p
- CDN для HLS-сегментов
- Предзагрузка следующего сегмента

## VPS ресурсы
Стартовый: 1 ядро, 2 GB RAM + 2 GB swap.

- FFmpeg конвертация, npm build, большой импорт — сообщать о рисках
- Celery: FFmpeg с лимитом памяти, 1 concurrent worker для тяжелых
- Gunicorn: **2 workers** (не 3+)
- Next.js: билдить локально/CI, на VPS `npm start`
- PostgreSQL: `shared_buffers=256MB`, `work_mem=4MB`
- Redis: `maxmemory 128mb` + `allkeys-lru`

**Апгрейд до 4GB RAM при:** 50+ активных пользователей, >3 видео/день, OOM в логах, API >500ms

---

## Celery задачи

| Очередь | Задача | Описание |
|---------|--------|----------|
| video | `process_uploaded_video` | FFmpeg → HLS, загрузка в S3 |
| video | `generate_video_thumbnail` | Превью |
| notifications | `send_email_notification` | Email |
| notifications | `send_push_notification` | PWA push |
| notifications | `send_booking_reminder` | За 1ч до занятия |
| notifications | `send_expiry_warning` | За 3 дня до истечения |
| payments | `process_payment_callback` | Webhook обработка |
| payments | `check_expired_subscriptions` | Periodic, каждые 30 мин |
| payments | `deactivate_expired_subscriptions` | Periodic, ежедневно |
| default | `import_questions_from_file` | CSV/Excel парсинг |
| default | `cleanup_old_sessions` | Periodic, ежедневно |
| default | `detect_suspicious_sessions` | Мультигео проверка |

---

## Redis ключи

```
cache:courses:list                     # TTL 5 мин
cache:tariffs:active                   # TTL 10 мин
cache:blog:articles:list               # TTL 5 мин
cache:user:{id}:progress               # TTL 1 мин
cache:tests:categories                 # TTL 30 мин
session:{session_key}
ratelimit:{ip}:{endpoint}
video:signed:{video_id}:{user_id}      # TTL 2ч
online:{user_id}                       # TTL 5 мин
user_sessions:{user_id}                # SET device_ids
```

---

## Мониторинг

**Старт (бесплатно):** Docker health checks, `docker stats/logs`, Celery Flower, `check_health` management command (cron 5 мин)

**Рост:** Sentry, UptimeRobot → Telegram

**Алерты в Telegram:** сервис упал, ошибка оплаты, диск >80%, RAM >90%, Celery очередь >100
