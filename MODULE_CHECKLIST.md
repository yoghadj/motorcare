# MotorCare Web App – Module Development Checklist

Generated from `requirement.md`. Use this list to plan and track development of each module.

**Next.js app (this checklist):** Implemented in `web/` (Next.js 15 + Tailwind + TypeScript + Prisma + MySQL local).  
Run from repo root: `cd web && npm install && cp .env.example .env` then set `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, run `npm run db:push`, `npm run db:seed`, then `npm run dev`.

---

## Core Modules

- [x] **1. User Account & Authentication** *(web: done)*
  - [x] Register (email, password, terms/privacy acceptance)
  - [x] Login / Logout
  - [x] Profile management (name, email, phone)
  - [x] Change password (from profile)
  - [x] Forgot / Reset password (email flow — API placeholder)
  - [x] Validation (email format, password min 8 chars, unique email)
  - [ ] *(Planned)* Push notification device registration

- [x] **2. Locale / Internationalization** *(web: done)*
  - [x] UI language switch (English / Bahasa Indonesia)
  - [x] Cookie-stored language preference
  - [x] Localized strings for key UI

- [x] **3. Roles & Admin Area** *(web: done)*
  - [x] Roles: `user` | `admin` (e.g. `users.role`)
  - [x] User: own garage only; dictionary view (no manage)
  - [x] Admin: all user capabilities + users list, view any user garage, full dictionary manage
  - [x] Admin middleware for protected routes
  - [x] Default admin seeder (e.g. ADMIN_EMAIL, ADMIN_PASSWORD from .env)

- [x] **4. Dictionary** *(web: done)*
  - [x] User: view own entries (card grid), CRUD own entries
  - [x] Admin: DataTable of all entries, full CRUD any entry
  - [x] Entry: text/title, description, optional image (upload, max 2 MB)
  - [x] Policy: owner or admin can edit/delete
  - [x] Hard delete with image cleanup

- [x] **5. Garage Management (Motorcycles)** *(web: done)*
  - [x] Add motorcycle (brand, model, year, engine CC, etc.)
  - [x] Edit motorcycle details
  - [x] Delete motorcycle (soft delete via API)
  - [x] View motorcycle list and summary
  - [x] Set default/active motorcycle
  - [x] Brand/model from config; image upload (optional)
  - [x] Current odometer field and validation

- [x] **6. Odometer Tracking** *(web: done)*
  - [x] Add odometer log (date, reading)
  - [x] View odometer history (list)
  - [x] Quick add from motorcycle detail
  - [x] Edit / Delete odometer entries (with validation)
  - [x] Calculate: daily/monthly/total distance, average daily, distance since last service
  - [x] Validation: no rollback, max gap 50,000 km

- [x] **7. Service History (Digital Logbook)** *(web: done)*
  - [x] Record service entry (date, odometer, workshop, notes, costs)
  - [x] Edit / Delete service entry (soft delete)
  - [x] View service history (chronological list)
  - [x] Service types: Regular Service, Repair, Emergency, Other
  - [x] Labor cost and replaced items (item name, quantity, unit cost, total)
  - [x] Total cost calculation
  - [ ] *(Future)* Attach photos/receipts
  - [ ] Link to maintenance schedule reset after service

- [x] **8. Fuel Tracker** *(web: done)*
  - [x] Log fuel refill (date, liters, total price, price per liter, odometer)
  - [x] Edit / Delete fuel entry
  - [x] View fuel history
  - [x] Full tank vs partial fill
  - [x] Fuel provider and type (from config)
  - [x] Calculate: km/l (between full-tank refills), monthly/yearly cost, cost per km, average consumption
  - [x] Consumption only between full-tank refills (logic to add)

- [x] **9. Dashboard** *(web: done)*
  - [x] Motorcycle overview; active bike highlighted
  - [x] Stats: motorcycle count, odometer entries, services, fuel logs, total km, total service cost
  - [x] Recent services and fuel (e.g. last 5 each)
  - [ ] Chart data (e.g. last 12 months: odometer, services, fuel, costs)
  - [x] Quick links to garage and data entry

- [x] **10. Motorcycle Detail Page** *(web: done)*
  - [x] Motorcycle info, image, current odometer; set active, edit, remove
  - [x] Tabs: Odometer, Services, Fuel, Analytics, Health Score, Repair, AI Analysis
  - [x] Per-tab tables and summaries
  - [x] Analytics: cost cards, charts, recommendations
  - [ ] Health: score, factor breakdown, recommendations
  - [ ] Repair form and latest recommendation
  - [ ] AI Analysis link/run/display

---

## Analytics & Cost

- [ ] **11. AI Motorcycle Condition Analysis (MVP 8a)**
  - [ ] Form-triggered analysis (no chat)
  - [ ] Use odometer, service history, fuel data
  - [ ] Store and display latest analysis with timestamp
  - [ ] Regenerate on demand
  - [ ] LLM integration (OpenRouter / Ollama / HuggingFace)

- [ ] **12. Cost Analytics (MVP 7)**
  - [ ] Monthly cost (current + last 12 months)
  - [ ] Yearly cost (current + last 5 years)
  - [ ] Cost per km (overall and per period)
  - [ ] Total cost of ownership
  - [ ] Cost trends: monthly stacked bar, yearly bar, category donut
  - [ ] Categories: service, fuel; *(future)* spare parts, other
  - [ ] Summary cards and projections
  - [ ] Recommendations when data is missing

---

## Maintenance & Scheduling

- [ ] **13. Smart Maintenance Schedule (MVP 6)**
  - [ ] Generate schedules by km interval and/or time interval
  - [ ] Standard items: engine oil, gear oil, brake pads, battery, spark plug, air filter, tire, chain & sprocket
  - [ ] Due date and due odometer calculation
  - [ ] Status: upcoming (500 km or 7 days), overdue
  - [ ] Reset schedule after service record
  - [ ] Customize intervals per motorcycle
  - [ ] Maintenance status display (upcoming/overdue/due soon)

---

## AI & Insights

- [ ] **14. Repair Module / AI Recommendations (MVP 8b)**
  - [ ] Form: motorcycle, user description of issue, optional odometer
  - [ ] AI recommendations using motorcycle + service context
  - [ ] Single request/response (no multi-turn chat)
  - [ ] Rate limiting (e.g. 10/hour per user)
  - [ ] Store response; show latest with timestamp
  - [ ] Response time target (e.g. &lt; 30 s)

- [ ] **15. Motor Health Score (MVP 9)**
  - [ ] Score 0–100 from: overdue maintenance, service frequency, component age, service history quality, odometer consistency, fuel anomalies
  - [ ] Score bands: Excellent / Good / Fair / Poor / Critical (with colors)
  - [ ] Explanation text and recommendations
  - [ ] Real-time calculation; display on motorcycle dashboard
  - [ ] *(Future)* Score history / trend chart

- [ ] **16. AI Insights (MVP 10)**
  - [ ] Background job (e.g. daily) to generate insights
  - [ ] Types: overdue alerts, rising cost, fuel anomalies, service interval tips, cost-saving, pattern analysis
  - [ ] Dashboard widgets/cards; read/unread; dismiss; link to actions
  - [ ] Timestamp per insight

---

## Notifications

- [ ] **17. Reminder & Notification**
  - [ ] Upcoming maintenance (7 days or 500 km)
  - [ ] Overdue maintenance
  - [ ] Weekly odometer reminder (if no entry in 7 days)
  - [ ] New AI insights available
  - [ ] Service milestone reminders
  - [ ] In-app notifications (badge, notification center)
  - [ ] Email notifications (optional, user preference)
  - [ ] Browser push notifications (web, with permission)
  - [ ] User settings: enable/disable types, frequency

---

## Content & UI

- [ ] **18. Maintenance Schedule UI (MVP 6)**
  - [ ] List of maintenance items with status
  - [ ] Filter and sort; optional calendar view

---

## Non-Functional / Platform

- [ ] **19. Security & Validation**
  - [ ] Session-based auth; password hashing
  - [ ] CSRF protection; input validation/sanitization
  - [ ] Policy-based authorization (e.g. Motorcycle, Dictionary)
  - [ ] Rate limiting (e.g. AI repair endpoint)
  - [ ] HTTPS in production

- [ ] **20. Performance & DevOps**
  - [ ] API/page performance targets (e.g. &lt; 500 ms, &lt; 2 s FCP)
  - [ ] Queue for AI and background jobs
  - [ ] Database indexes; optional Redis cache
  - [ ] Docker/containerization; CI/CD; backups; monitoring

- [ ] **21. Testing**
  - [ ] Unit tests (business logic)
  - [ ] Integration tests (routes/API)
  - [ ] E2E for critical flows
  - [ ] Security and validation tests

- [ ] **22. Data & Compliance**
  - [ ] Data retention and export
  - [ ] User data deletion (e.g. GDPR)
  - [ ] Audit logging for key actions

---

## Future / Post-MVP (Out of Scope for Initial Checklist)

- Mobile native apps (iOS/Android)
- Workshop marketplace
- Spare parts ordering
- Social / community
- Insurance integration
- Export (PDF, CSV)
- Manufacturer API integration
- Predictive maintenance (ML)

---

**Legend**

- Unchecked `[ ]` = to be developed or verified
- Check off each sub-item when the feature is implemented and accepted
- *Planned* / *Future* = deferred to a later phase

**Reference:** `requirement.md` (MotorCare PRD v1.4, March 2026)
