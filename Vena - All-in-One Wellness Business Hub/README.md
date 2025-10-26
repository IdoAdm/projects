# Vena — The All-in-One Wellness Business Hub

Vena is a digital platform built to help independent wellness professionals manage their business effortlessly.  
It brings together scheduling, client management, personalized landing pages, and automated workflows — all in one seamless, interactive hub.

---

## Overview

Vena gives wellness professionals the tools to connect with clients, manage their schedule, and grow their boutique practice with ease.  
The platform eliminates the need for multiple apps by integrating everything into one place — from booking to automation.

---

## Core Features

- **Intelligent Time Management**  
  Advanced scheduling tools that optimize your calendar and maximize client focus.

- **Automated Workflow Generation**  
  Automatically generate post-appointment tasks and follow-up workflows to maintain strong client relationships.

- **Dynamic Personal Landing Page**  
  Showcase your professional brand with a fully customizable landing page to attract and retain clients.

- **Client Management**  
  Store and organize client information with a centralized dashboard connected to Supabase.

- **Integrated Communication**  
  Send personalized updates, notifications, and confirmations directly to clients.

- **Real-Time Sync**  
  All updates are instantly synchronized across the platform for both professionals and clients.

---

## For Modern Wellness Professionals

Vena is designed for coaches, trainers, therapists, and independent wellness experts who want to simplify their day-to-day operations.

It helps you:
- Elevate your professional image online
- Simplify client bookings and payments
- Save valuable administrative hours
- Share personalized content effortlessly
- Grow your practice with powerful digital tools

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Backend:** Supabase (PostgreSQL, Auth, Functions)  
- **Deployment:** Render  
- **Email Integration:** Resend API or SMTP  
- **Real-time Sync:** Supabase subscriptions

---

## Environment Configuration

Copy `.env.local` and configure:

```bash
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional email integration
RESEND_API_KEY=your_resend_api_key
# OR SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@vena.software
````

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## License

This project is part of the **Vena wellness ecosystem**, providing modern digital tools for wellness professionals to manage clients, automate workflows, and grow their business.

```
