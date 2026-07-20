# Smart RentHouse

**The end of the monthly staircase for Cambodian landlords.**

Smart RentHouse is a community rental management web app built for small, independent Cambodian landlords managing multi-unit buildings. It replaces the manual routine of climbing stairs to read utility meters, calculating bills by hand, and chasing payment screenshots in a chat app — with a shared, digital ledger for every room, renter, and payment.

This repository contains the frontend prototype: a React + TypeScript single-page app exported from Figma Make, running entirely client-side against a mock local database.

## Why

Cambodian rental billing is uniquely staggered — each tenant's rent is due on a personal "lucky" date or payday rather than a single fixed day for the whole building — so landlords end up reading meters and calculating bills almost every day of the month. Existing options don't fit:

- **Enterprise property software** is expensive and built for large corporations.
- **WhatsApp + paper ledgers** are free but have no calculation engine and no permanent record.

Smart RentHouse aims to sit in between: affordable, purpose-built for the way meters, dates, and QR payments actually work in Cambodia, and usable without an accounting background.

## Core features (this prototype)

- **Landlord & renter roles** — separate dashboards and navigation for landlords (building owners) and renters (tenants), gated by role.
- **Phone + OTP authentication** — landlords register a community and get a shareable invite code; renters join a community with that code. All auth is simulated locally (no real SMS is sent).
- **Room roster** — landlords manage rooms/units, rent, and per-room water/electricity rates.
- **Meter readings** — landlords enter meter readings and rates per room; renters have a live camera-capture flow for submitting their own readings.
- **Automatic billing math** — rent + (new meter reading − old reading) × rate for water and electricity, calculated automatically and shown as an itemized invoice.
- **Payments** — landlords can log payments; renters see a simulated bank QR (ABA/ACLEDA-style) payment flow with receipt upload.
- **Maintenance requests** — renters can submit issues (plumbing, electrical, structural, etc.); landlords see and track them.
- **History** — renters can view their own usage and payment history.

Some capabilities described in the original product vision doc (`SmartRent_KH_Digital_Blueprint.md`) — such as AI-based OCR meter reading with a confidence threshold, AI bank-receipt matching, anomaly detection on usage spikes, and smart parking scheduling — are represented in this codebase as simulated/mocked behavior (e.g. `simulateOCR` in `src/app/pages/renter/Meter.tsx`) rather than real AI integrations, since this is a frontend-only prototype.

## Tech stack

- **React 18** + **TypeScript**, bundled with **Vite**
- **React Router 7** for routing (`src/app/routes.tsx`)
- **Tailwind CSS 4** for styling, plus **shadcn/ui** (Radix UI primitives) components
- **Recharts**, **lucide-react**, and other supporting UI libraries (see `package.json`)
- No backend — all data is modeled and persisted in the browser's `localStorage` via a lightweight mock database layer

## Project structure

```
src/
  app/
    App.tsx               # App shell / router provider
    routes.tsx             # Route definitions (auth, landlord, renter)
    lib/db.ts               # Mock client-side "database" (localStorage-backed)
    context/
      AuthContext.tsx       # Auth state, OTP flows, current user/community
      LandlordContext.tsx    # Room roster, billing state for the landlord
    layouts/                # Shared layout shells per role
    components/             # Shared UI components (incl. shadcn/ui in ui/)
    pages/
      auth/                 # Login, registration, join-community flows
      landlord/              # Dashboard, Rooms, Meter, Invoice, Payment, Maintenance
      renter/                # Dashboard, Meter (camera capture), Maintenance, History
  styles/                   # Tailwind, theme, and global CSS
  imports/                  # Static assets imported from the original Figma design
```

### The mock database (`src/app/lib/db.ts`)

Since this project ships as a static frontend with no backend server, `db.ts` models users, communities, rooms, meter usage, and payments, and persists them to `localStorage` so the app behaves like a real system across reloads. Every page only talks to the functions exported from this file, so swapping in a real backend (e.g. a Postgres API plus an SMS provider for OTPs) should only require replacing this one module.

## Running the code

Install dependencies:

```bash
npm i
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Design source

The original design is available on Figma: https://www.figma.com/design/UqmOD3Atpku6oshukO2tFw/Community-Rental-Management-Website

## Attributions

This project includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT license) and photos from [Unsplash](https://unsplash.com) — see `ATTRIBUTIONS.md` for details.
