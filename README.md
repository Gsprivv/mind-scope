# Mindful Check (UK)

A mental wellness web app for the UK with check-ins, personal history charts, support chat, contact form, and a staff admin area.

## Features

### For users (must log in for check-ins)
- Sign up with full name, email, password, date of birth, age, and UK mobile number
- Wellness check-in with automatic score and risk level
- Personal history with pie and line charts

### For everyone (no login required)
- **Support chat** — floating chat button (bottom-right) and footer button with chat icon
- **Contact** (`/contact`) — contact form plus company email and phone

### For staff
- Small dot in the site footer (below the chat button) → staff code: **`101278`**
- View all users and all check-in history

## UK crisis support (in footer)

| Service | Contact |
|---------|---------|
| Emergency | **999** |
| Samaritans | **116 123** |
| NHS 111 | **111** |
| Shout | Text **SHOUT** to **85258** |
| Mind Infoline | **0300 123 3393** |

## Company contact (demo)

- **Email:** support@mindfulcheck.co.uk  
- **Phone:** 020 7946 0958  

Change details in `src/constants/company.ts`.

## Run locally

```bash
cd "/Users/gs-privv/App Project"
npm install
npm run dev
```

Open **http://localhost:5173/**

## Privacy

Demo data is stored in browser **localStorage** only. Not suitable for real clinical use without a secure backend.

This app is not medical advice.
