# ApartmaniPMS — Evidencija napretka

> Pracenje razvoja apartmani.ba PMS sistema

## Faza 1: MVP (ZAVRSENO)

| Tok | Opis | Status | Datum |
|-----|------|--------|-------|
| A — Srpska lokalizacija | sr-Latn za backend, frontend (34 fajla), admin (41 fajl) | ZAVRSENO | 2026-02-27 |
| B — Tipovi i modeli | BookingSource enum, ChannexMapping, OwnerDashboard tipovi, Booking model prosiren | ZAVRSENO | 2026-02-27 |
| C — Channex servisni sloj | REST klijent, mapper, sync, webhook handler, rute | ZAVRSENO | 2026-02-27 |
| D — Portal za vlasnike | Dashboard, kalendar, prihod — backend API + admin stranice | ZAVRSENO | 2026-02-27 |
| E — Oznacavanje izvora | Direktne rezervacije oznacene kao DIRECT, push ka Channex-u | ZAVRSENO | 2026-02-27 |

### Poznati nedostaci iz Faze 1
- Nema unit testova za novi kod (Channex servis, webhook, owner portal)
- End-to-end tok oznacavanja izvora rezervacija treba verifikaciju

---

## Faza 2: Finansije i poboljsanja (U TOKU)

| Stavka | Opis | Status | Datum |
|--------|------|--------|-------|
| Seed data za testiranje | 3 vlasnika, 10 gostiju, ~110 rezervacija, sezone, popusti, isplate, poruke | ZAVRSENO | 2026-02-28 |
| Ispravke agencija/vlasnika | Uklonjen avatar filter, AccountCircle fallback, vlasnici vidljivi svuda | ZAVRSENO | 2026-02-28 |
| Dashboard sa grafikonima | Admin vidi sve vlasnike (agregirano + filter), agency vidi samo svoje | ZAVRSENO | 2026-02-28 |
| UI za upravljanje cijenama | Sezonske cijene, popusti, property search fix ($in:[] bug) | ZAVRSENO | 2026-02-28 |
| Modul za isplate vlasnicima | Mjesecni izvjestaji, odobrenje, oznacavanje placanja | CEKA | — |
| Proslijedjivanje poruka gostiju | Channex → PMS → vlasnik | CEKA | — |
| SEO optimizacija | Schema.org, sitemap, SSR/SSG | CEKA | — |
| Clansko snizenje | Loyalty popusti, samo za direktne | CEKA | — |

---

## Faza 3: Skaliranje (PLANIRANO)

| Stavka | Status |
|--------|--------|
| Multi-tenant arhitektura | CEKA |
| Onboarding wizard | CEKA |
| Stripe Billing pretplate | CEKA |
| White-label teme | CEKA |
| Mobilna aplikacija — srpski | CEKA |
| Dodatni jezici (hr, me, sl) | CEKA |
| Njemacki prevod | CEKA |
| Analytics dashboard | CEKA |
| Raspored ciscenja/odrzavanja | CEKA |
| Smart lock integracija | CEKA |

---

## Dnevnik promjena

| Datum | Commit | Opis |
|-------|--------|------|
| 2026-02-27 | d09dfbd | feat: implementacija Faze 1 MVP (109 fajlova) |
| 2026-02-27 | d1defe6 | fix: ispravke TypeScript gresaka u owner portal stranicama |
| 2026-02-28 | ee7abd2 | feat: seed data, admin ispravke, owner dashboard poboljsanja (21 fajl) |
