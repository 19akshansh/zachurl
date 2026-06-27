<div align="center">

<img src="./public/mainAssets/logo.svg" width="320" alt="Zachurl Logo" />

### Open-Source URL Shortener with Analytics & QR Codes

Shorten links, generate QR codes, and track click analytics — all in one clean dashboard.

<p align="center">
  <a href="https://zachurl.vercel.app">Website</a>
  ·
  <a href="#">Documentation</a>
  ·
  <a href="https://github.com/19akshansh/zachurl/issues">Report Bug</a>
  ·
  <a href="https://github.com/19akshansh/zachurl/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/19akshansh/zachurl.svg?style=for-the-badge" />
  <img src="https://img.shields.io/github/forks/19akshansh/zachurl.svg?style=for-the-badge" />
  <img src="https://img.shields.io/github/issues/19akshansh/zachurl.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square" />
  <img src="https://img.shields.io/badge/tRPC-API-2596BE?style=flat-square" />
  <img src="https://img.shields.io/badge/BetterAuth-Authentication-green?style=flat-square" />
</p>

</div>

---

## 🚀 What is Zachurl?

Zachurl is a self-hostable URL shortener built for people who want more than just a short link. Create named, trackable short URLs, generate QR codes, and monitor click analytics over time — all behind a clean, fast dashboard.

Whether you're sharing links in campaigns, tracking referrals, or just cleaning up long URLs, Zachurl gives you full ownership of your data and infrastructure.

---

## ✨ Features

**URL Management**
- Create short URLs with optional custom names
- View, edit, and manage all your links in one place
- Instant redirect on visit (http/https only, validated)

**QR Code Generation**
- Auto-generate QR codes for any shortened link
- Manage and download QR codes from the dashboard

**Click Analytics**
- Per-URL click tracking with timestamps
- Time-range filtering: 7d, 30d, 90d, All
- Area chart visualizations powered by Recharts
- Paginated analytics list with trend indicators

**Authentication**
- Email/password with email verification
- Google OAuth
- GitHub OAuth
- Forgot/reset password flows

**Billing**
- Free and Pro tiers via Polar
- In-app upgrade modal
- Subscription-aware feature gating

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Components | shadcn/ui, Radix UI, Framer Motion |
| API | tRPC v11, TanStack Query |
| Database | PostgreSQL, Prisma ORM |
| Auth | Better Auth, Google OAuth, GitHub OAuth |
| Billing | Polar |
| Email | Nodemailer |
| Charts | Recharts |
| Linting | Biome |

---

## 🚀 Quick Start

### Clone the repository

```bash
git clone https://github.com/19akshansh/zachurl.git
cd zachurl
```

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Configure environment variables

Copy the example file and fill in your values:

```bash
cp example.env .env
```

```env
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="your-postgresql-connection-string"

# Better Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Nodemailer
EMAIL_USER="you@gmail.com"
EMAIL_PASS="your-16-digit-app-password"
EMAIL_FROM='"Zachurl" <you@gmail.com>'

# Polar (billing)
POLAR_ACCESS_TOKEN=""
POLAR_SERVER="sandbox"
POLAR_PRO_PRODUCT_ID=""
NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID=""
POLAR_SUCCESS_URL="http://localhost:3000/success?checkout_id={CHECKOUT_ID}"
```

### Set up the database

```bash
npx prisma generate
npx prisma migrate deploy
```

### Start the development server

```bash
npm run dev
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign in, sign up, forgot/reset password
│   ├── (dashboard)/
│   │   ├── (management)/ # URLs, QR codes
│   │   └── (insights)/   # Analytics
│   └── (ids)/[urlId]/    # Short URL redirect handler
├── components/           # Shared UI components
├── features/
│   ├── auth/             # Auth forms and layouts
│   ├── management/
│   │   ├── urls/         # URL CRUD, router, validator
│   │   └── qrs/          # QR code management
│   └── insights/
│       └── analytics/    # Click analytics and charts
├── lib/                  # Auth, DB, mail, Polar, utils
├── trpc/                 # tRPC client, server, routers
└── config/               # Constants, env schema
```

---

## 🗺️ Roadmap

- [ ] Custom short slugs
- [ ] Link expiration / TTL
- [ ] Click geo and device breakdown
- [ ] Bulk URL import
- [ ] Public API for programmatic shortening
- [ ] Team workspaces

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Open a pull request

---

## 📜 License

Licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with Next.js, Prisma, tRPC, and Better Auth.

If Zachurl helps you, consider giving the repo a ⭐

</div>