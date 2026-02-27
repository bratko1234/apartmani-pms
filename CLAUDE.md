# ApartmaniPMS

> Fork of [Movin' In](https://github.com/aelassas/movinin) (MIT) — Vacation rental PMS for ~200 apartments in Trebinje, Bosnia & Herzegovina. Domain: **apartmani.ba**

## Quick Reference

| Item | Value |
|------|-------|
| Upstream | `github.com/aelassas/movinin` (v6.7.0) |
| Fork | `github.com/bratko1234/apartmani-pms` |
| Stack | Node.js, Express, TypeScript, MongoDB, React, MUI, React Native |
| Channel Manager | Channex.io (WhiteLabel plan) |
| Payment | Stripe (primary), monri.ba (fallback) |
| Hosting | Hetzner (Frankfurt/Falkenstein) |
| Default Locale | Serbian Latin (sr-Latn), also English + German |

---

## Project Structure

```
apartmani-pms/
├── backend/          # Express API server (Node.js + TypeScript + MongoDB)
│   └── src/
│       ├── models/         # Booking, Property, User, Country, Location, etc.
│       ├── controllers/    # agencyController, bookingController, propertyController, etc.
│       ├── middlewares/     # Auth middlewares
│       ├── routes/         # Express routes
│       ├── lang/           # i18n (en.ts, fr.ts → add sr.ts)
│       ├── config/         # App configuration
│       ├── payment/        # Stripe + PayPal integration
│       └── utils/          # Helpers
├── admin/            # Admin panel (React + MUI + Vite)
│   └── src/
│       ├── pages/          # Admin CRUD pages
│       ├── components/     # Shared UI components
│       ├── lang/           # Admin i18n
│       └── services/       # API client calls
├── frontend/         # Guest-facing website (React + Vite)
│   └── src/
│       ├── pages/          # Search, property detail, booking, etc.
│       ├── components/     # UI components
│       ├── lang/           # Per-page translation files (about.ts, booking.ts, etc.)
│       └── services/       # API client calls
├── mobile/           # React Native app (iOS + Android)
│   └── lang/               # Mobile i18n (en.ts, fr.ts → add sr.ts)
├── packages/         # Shared packages
│   ├── movinin-types/      # Shared TypeScript types
│   ├── movinin-helper/     # Shared utility functions
│   ├── currency-converter/ # Currency conversion
│   ├── disable-react-devtools/
│   └── reactjs-social-login/
├── __config/         # Config templates
├── __scripts/        # Dev/deploy scripts
├── __services/       # Systemd service files
└── docker-compose.yml
```

---

## Business Model

### Hybrid Revenue
- **OTA Bookings** (Airbnb 15.5% fee, Booking.com ~15%): OTA collects payment, pays owner. We charge owner a management fee.
- **Direct Bookings** (apartmani.ba): Guest pays via Stripe to our account. We keep 10-15% commission, pay remainder to owner.

### Rate Parity Strategy
- Same base nightly rate on all channels
- Direct channel offers added value: free breakfast, late checkout, loyalty/members pricing (10% off), long-stay discounts, waived cleaning fees
- Effectively 15-20% cheaper for guest on direct without breaking rate parity

---

## What Must Be Built (on top of Movin' In)

### 1. Channex.io Integration (CRITICAL)
Channel manager for Airbnb + Booking.com connectivity.

**New files to create:**
```
backend/src/channex/
  channex.service.ts      # REST API client (auth with API key)
  channex.webhook.ts      # Webhook receiver for booking events
  channex.sync.ts         # Scheduled sync jobs (rates, availability)
  channex.mapper.ts       # Data model ↔ Channex format mapping
```

**Integration points:**
- Properties API — sync property data to Channex
- Room Types API — map apartment types
- Rate Plans API — push seasonal pricing, min stays
- Availability/Inventory API — two-way calendar sync
- Bookings API — receive OTA bookings via webhook, push direct bookings
- Messaging API — forward guest messages from OTAs
- Open Channel API — register apartmani.ba as booking source

**Webhook events:** `booking_new`, `booking_modification`, `booking_cancellation`, `booking_unmapped_room`

**Docs:** https://docs.channex.io | Staging: https://staging.channex.io

### 2. Owner Portal
Restricted view for property owners (agencies in Movin' In = owners here):
- Dashboard: occupancy rate, revenue by channel, upcoming bookings
- Bookings list with source channel, dates, guest info, payment status
- Visual calendar per property
- Financial statements: monthly breakdown (gross, OTA commission, management fee, net)
- Payout history
- Property details (view-only)

### 3. Financial/Payout Module
New MongoDB model `OwnerPayout`:
```typescript
{
  ownerId: ObjectId
  period: { month, year }
  properties: [{
    propertyId: ObjectId
    bookings: [{
      bookingId, source ("airbnb"|"booking_com"|"direct"|"other"),
      guestName, checkIn, checkOut, nights,
      grossRevenue, otaCommission, managementFee, cleaningFee, netToOwner
    }]
    totalGross, totalOtaCommission, totalManagementFee, totalNetToOwner
  }]
  totalPayout: number
  status: "draft" | "approved" | "paid"
  paidAt: Date
  paymentMethod: string
  notes: string
}
```

**Flow:** Auto-generate monthly → admin reviews → admin approves → marks paid after bank transfer → owner sees in portal.

### 4. Rate Management
- Seasonal pricing (summer, winter, holidays)
- Min/max stay restrictions per season
- Last-minute discounts (auto-reduce X days before if unbooked)
- Long-stay discounts (weekly/monthly, direct only)
- Push rate changes to Channex → OTAs
- Independent pricing rules for direct (members discount, etc.)

### 5. Direct Booking Website (apartmani.ba)
Consider Next.js for SSR/SEO or adapt existing React frontend:
- Home: hero + search (location, dates, guests), featured properties
- Search results: filterable grid
- Property detail: photos, amenities, calendar, map, reviews, booking widget
- Booking flow: dates → guest details → Stripe payment → confirmation
- User accounts: history, favorites, profile
- SEO: SSR/SSG, Schema.org (LodgingBusiness), per-property URLs, sitemap
- Languages: Serbian (primary), English, German

### 6. Serbian Localization (sr-Latn)
Add Serbian Latin locale files throughout. **No Cyrillic needed.**

**Files to create:**
- `backend/src/lang/sr.ts`
- `admin/src/lang/sr.ts`
- `frontend/src/lang/*.ts` (per-page pattern: about.ts, booking.ts, etc.)
- `mobile/lang/sr.ts`

**Key terms:**

| English | Serbian (Latin) |
|---------|----------------|
| Properties | Nekretnine |
| Bookings | Rezervacije |
| Guests | Gosti |
| Availability | Dostupnost |
| Check-in | Prijava |
| Check-out | Odjava |
| Price per night | Cijena po noći |
| Book now | Rezerviši odmah |
| Owner Portal | Portal za vlasnike |
| Revenue | Prihod |
| Payout | Isplata |
| Management fee | Provizija za upravljanje |
| Search | Pretraga |
| Apartments | Apartmani |

**Formatting:** European (DD.MM.YYYY, 1.500,00). Currency: BAM (KM) for owners, EUR for guests.

---

## Payment Flows

### Flow A: OTA Booking (Airbnb)
Guest books on Airbnb → Airbnb collects payment → Channex webhook → PMS creates booking → Airbnb pays owner (minus 15.5%) → Monthly: system calculates management fee → owner pays us

### Flow B: OTA Booking (Booking.com)
Guest books on Booking.com → payment online or at property → Channex webhook → PMS creates booking → Booking.com pays owner (minus ~15%) or guest pays at check-in → Monthly: management fee calculated

### Flow C: Direct Booking (apartmani.ba)
Guest books on site → Stripe payment to our account → PMS creates booking → push to Channex (Open Channel API) to block OTA calendars → deduct 10-15% commission → pay owner remainder → monthly statement

---

## Phased Build Plan

### Phase 1: MVP (4-6 weeks)
- [x] Fork Movin' In, set up dev environment
- [ ] Add Serbian locale (sr-Latn) for all components
- [ ] Integrate Channex: property sync, rate push, availability sync
- [ ] Implement Channex booking webhooks
- [ ] Basic owner portal (bookings, calendar, revenue)
- [ ] Deploy apartmani.ba with search + booking + Stripe
- [ ] Register apartmani.ba as Open Channel in Channex

### Phase 2: Financial & Polish (3-4 weeks)
- [ ] Owner payout module (monthly statements, approve, mark paid)
- [ ] Rate management UI (seasonal pricing, push to Channex)
- [ ] Guest messaging passthrough (Channex → PMS → owner)
- [ ] Owner dashboard with charts
- [ ] SEO optimization
- [ ] Members-only pricing / loyalty discounts

### Phase 3: Scale & Productize (ongoing)
- [ ] Multi-tenant architecture
- [ ] Onboarding wizard
- [ ] Subscription billing (Stripe Billing)
- [ ] White-label theming
- [ ] Mobile app Serbian localization
- [ ] Additional languages (Croatian, Montenegrin, Slovenian)
- [ ] German translation polish
- [ ] Analytics dashboard
- [ ] Cleaning/maintenance scheduling
- [ ] Smart lock integration (Nuki, TTLock)

---

## Architecture

```
OTA Channels (Airbnb, Booking.com, Expedia, Vrbo)
        │ (certified API connections)
        ▼
   CHANNEX.IO (WhiteLabel)
        │ REST API + Webhooks
        ▼
   PMS BACKEND (this repo — Express/TypeScript/MongoDB)
   ├── Properties, Bookings, Guests, Owners (existing Movin' In)
   ├── Channex Service (NEW — sync, webhooks, mapper)
   ├── Financial/Payout Module (NEW)
   ├── Rate Management (NEW)
   └── Notifications (existing — extend)
        │
   ┌────┼─────────────┬──────────────┐
   ▼    ▼             ▼              ▼
 Admin  Owner       apartmani.ba   Mobile
 Panel  Portal      (guest site)   App
 (React)(React)     (Next.js/React)(React Native)
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Base project | Movin' In | MIT, MERN stack, multi-agency built in, 60% done |
| Channel manager | Channex.io | Only viable path to Airbnb/Booking.com APIs |
| Database | MongoDB (existing) | Keep what works; add PostgreSQL later if needed for financial reporting |
| Guest site | Next.js or React+SSR | SEO requires server-side rendering |
| Payment | Stripe | Works in Bosnia, supports EUR + BAM |
| Hosting | Hetzner | EU data residency, affordable |
| Locale | sr-Latn default | Most common in digital context in BiH |

---

## Development Commands

```bash
# Backend
cd backend && npm run dev          # Dev server with nodemon
cd backend && npm run build        # Build TypeScript
cd backend && npm test             # Run tests with coverage

# Admin panel
cd admin && npm run dev            # Vite dev server

# Frontend
cd frontend && npm run dev         # Vite dev server

# Mobile
cd mobile && npx expo start        # Expo dev server

# Lint (root)
npm run lint                       # ESLint across all packages

# Docker
docker-compose up                  # Full stack
docker-compose -f docker-compose.dev.yml up  # Dev mode
```

---

## Git Workflow

- **upstream** remote: `aelassas/movinin` (to pull upstream updates)
- **origin** remote: `bratko1234/apartmani-pms` (our fork)
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci)
- Branch strategy: `main` for stable, feature branches for development

---

## Useful Links

- [Movin' In Repo](https://github.com/aelassas/movinin)
- [Movin' In Docs](https://movin-in.github.io/)
- [Channex API Docs](https://docs.channex.io)
- [Channex Staging](https://staging.channex.io)
- [Channex Open Channel API](https://docs.channex.io/for-ota/open-channel-api)
- [Channex PMS Certification Tests](https://docs.channex.io/api-v.1-documentation/pms-certification-tests)
- [Stripe Bosnia](https://stripe.com/ba)
- [Monri.ba (local payment)](https://monri.ba)

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Channex outage/price hike | Abstract behind service layer; swappable to Rentlio, SiteMinder |
| OTA API changes | Channex handles this |
| MongoDB not ideal for financials | Add PostgreSQL alongside if needed |
| Rate parity penalties | Value-add strategy (extras, not price cuts) on direct |
| Scaling past 200 units | Node.js handles it; Channex scales at $0.50/unit |
