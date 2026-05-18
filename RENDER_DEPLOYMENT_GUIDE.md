# Render Deployment Guide

## Service Setup

- Service type: Web Service
- Runtime: Python 3
- Root directory: `barak-upload` (only if your repo root is the parent folder)
- Build command:

```text
pip install -r requirements.txt
```

- Start command:

```text
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2
```

## Persistent Disk

Create one persistent disk with these values:

- Name: `barka-data`
- Mount path: `/var/data`
- Size: `1 GB`

## Environment Variables

Add these values in Render:

```text
BARKA_SECRET_KEY=<generate a long random secret>
BARKA_ADMIN_USERNAME=admin
BARKA_ADMIN_PASSWORD=<set a strong password>
BARKA_DATABASE=/var/data/barka.db
BARKA_UPLOAD_FOLDER=/var/data/uploads/products
FLASK_DEBUG=0
PYTHONUNBUFFERED=1
MM_TELEGRAM_BOT_TOKEN=<your telegram bot token>
MM_TELEGRAM_CHAT_ID=<your telegram chat id>
```

## Recommended Manual Steps

1. Push the latest code to your Git repository.
2. In Render, create a new Web Service from that repository.
3. If the repository root is not `barak-upload`, set Root Directory to `barak-upload`.
4. Add the persistent disk mounted at `/var/data`.
5. Add all environment variables listed above.
6. Deploy the service.
7. After first deploy, open `/admin/login` and change the admin password value in Render if needed.

## Notes

- Uploaded product images will be stored under `/var/data/uploads/products`.
- SQLite database will persist at `/var/data/barka.db`.
- The application already supports `PORT`, `BARKA_DATABASE`, and `BARKA_UPLOAD_FOLDER`.
- If Telegram features are optional for the first deployment, you can leave `MM_TELEGRAM_BOT_TOKEN` and `MM_TELEGRAM_CHAT_ID` empty, but WhatsApp/Telegram-related features that depend on them will not work.

## Existing Deployment Files

- `render.yaml`
- `.env.example`
