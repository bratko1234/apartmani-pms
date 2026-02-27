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
| Modul za isplate vlasnicima | Mjesecni izvjestaji, odobrenje, oznacavanje placanja | CEKA | — |
| UI za upravljanje cijenama | Sezonske cijene, min/max nocenja, push ka Channex-u | CEKA | — |
| Proslijedjivanje poruka gostiju | Channex → PMS → vlasnik | CEKA | — |
| Dashboard sa grafikonima | Grafovi zauzetosti i prihoda za vlasnike | CEKA | — |
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
