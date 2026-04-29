# LEDO AI — Voice AI Receptionist

> **Never miss another call.** LEDO AI answers every inbound call, books appointments, captures leads, and transfers hot callers — automatically, 24/7.

**Domain:** https://ledo.ai
**Stack:** Next.js 14 · Express.js · PostgreSQL · Prisma · Twilio · OpenAI GPT-4o · BullMQ · Redis

---

## Features (MVP)

- **Inbound Call Answering** — AI answers instantly with natural speech (Twilio + Polly Neural TTS)
- **FAQ Handling** — Train LEDO with your Q&A; it answers common questions during calls
- **Appointment Booking** — AI collects caller info and books slots (Google Calendar sync)
- **Voicemail Capture** — Records + transcribes voicemails when caller prefers
- **Call Transfer** — Warm transfers to your team when human needed
- **Call Summary** — GPT-4o generates a summary after every call
- **SMS/Email Notifications** — Instant alerts for calls, voicemails, bookings (SendGrid + Twilio SMS)
- **HubSpot CRM Sync** — Automatically upserts contacts + notes after every call

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Redis instance
- Twilio account
- OpenAI API key

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
# Fill in your API keys
```

### 3. Set up the database
```bash
pnpm --filter @ledo/web exec prisma migrate dev --name init
# or for quick setup:
pnpm --filter @ledo/web exec prisma db push
```

### 4. Start development
```bash
pnpm dev
# Web: http://localhost:3000
# API: http://localhost:3001
```

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o) |
| `REDIS_URL` | Redis connection string |
| `SENDGRID_API_KEY` | SendGrid for email notifications |
| `HUBSPOT_API_KEY` | HubSpot private app token |

---

## Twilio Setup

1. Create a Twilio account at twilio.com
2. Purchase a phone number
3. Set the **Voice webhook URL** to: `https://api.ledo.ai/twilio/inbound`
4. Set the **Status callback URL** to: `https://api.ledo.ai/twilio/status`
5. Add your Twilio credentials to `.env`

### Call Flow
```
Inbound Call → Twilio → POST /twilio/inbound
  → AI greets caller (TTS)
  → Caller speaks → Twilio speech recognition
  → POST /twilio/process-speech
  → GPT-4o determines intent (FAQ / book / transfer / voicemail)
  → Response spoken to caller (TTS)
  → Call ends → BullMQ job queued
  → Post-call: summary generated, CRM synced, notification sent
```

---

## Deploy to Railway

### Service 1: Web (Next.js Dashboard)
1. Connect your GitHub repo to Railway
2. Create a new service pointing to `apps/web/`
3. Add all env vars from `.env.example`
4. Railway auto-detects Next.js and deploys

### Service 2: API (Express Webhooks)
1. Create another Railway service pointing to `apps/api/`
2. Add all env vars
3. Set start command: `node dist/index.js`
4. Point your Twilio webhooks to this service's Railway URL

### Service 3: PostgreSQL
- Add Railway PostgreSQL plugin to your project
- Copy the `DATABASE_URL` to your web and api services

### Service 4: Redis
- Add Railway Redis plugin
- Copy `REDIS_URL` to your api service

---

## Project Structure

```
ledo-ai/
├── apps/
│   ├── web/                    # Next.js 14 App (Dashboard + API routes)
│   │   ├── src/app/            # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── auth/           # Sign in / Sign up
│   │   │   ├── onboarding/     # Setup wizard
│   │   │   └── api/            # Next.js API routes
│   │   └── prisma/             # Database schema
│   └── api/                    # Express.js API (Twilio webhooks)
│       └── src/
│           ├── routes/         # Express routes
│           ├── services/       # AI, notifications, CRM
│           └── queues/         # BullMQ job queues
└── packages/
    └── shared/                 # Shared TypeScript types
```

---

## Go-To-Market Strategy

See `GTM.md` for the complete go-to-market playbook.
