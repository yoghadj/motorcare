# MOTORCARE - PRODUCT REQUIREMENTS DOCUMENT

**Version:** 1.4  
**Last Updated:** March 3, 2026  
**Status:** Web app implemented (Laravel + Blade). MVP 1–5, Dictionary, Roles, MVP 7 (Cost Analytics), MVP 8a (AI Condition Analysis), MVP 8b (Repair Module), MVP 9 (Health Score) done. MVP 6 (Smart Maintenance Schedule), MVP 10 (AI Insights), and Notifications planned.

**Implementation status (current):**
- **Done:** User account & auth (register, login, logout, profile, password change, forgot/reset password), Garage (motorcycles with brand/model from config, image upload, set active), Odometer tracking, Service history with replaced items (ServiceItem) and labor cost, Fuel tracker (config fuel providers/types), Dictionary (users CRUD own entries; admin manage all + DataTable), Roles (admin/user), Admin area (users list, view user garage), Default admin seeder (ADMIN_EMAIL, ADMIN_PASSWORD), Locale (EN/ID), AI Motorcycle Condition Analysis (MVP 8a), Cost Analytics (MVP 7), Repair Module (MVP 8b), Motor Health Score (MVP 9), Dashboard (stats, recent activity, chart data).
- **Stack:** Laravel (web), Blade views, Sneat UI, MySQL/SQLite, OpenRouter/Ollama/HuggingFace LLM (config ai.php).
- **Planned:** Smart maintenance schedule (MVP 6), AI Insights (MVP 10), Notifications, Push notification registration.

---

## 1. EXECUTIVE SUMMARY

MotorCare is a mobile/web application designed to help motorcycle owners maintain their vehicles proactively through:
1. Automatic maintenance scheduling
2. Digital service logbook
3. Vehicle cost tracking
4. Fuel consumption tracking
5. AI repair recommendations when the motorcycle feels off or unusual

**Primary Goal:**
Shift user behavior from reactive maintenance → proactive maintenance.

**Core Value Propositions:**
1. Longer vehicle lifespan
2. Lower maintenance cost
3. Never forget servicing
4. Complete service history
5. AI-powered insights

**Initial Target Market:** Indonesia (motorcycles as primary transportation)

**Platform:** Web-based application (mobile-responsive), with future mobile app expansion

---

## 2. BUSINESS OBJECTIVES

**Primary Goals:**
1. Help users maintain motorcycle health effectively
2. Increase user retention through reminders and habit tracking
3. Build a foundation for monetization

**Monetization Strategy:**
1. Premium subscription (future phase)
2. Workshop & spare part marketplace (future phase)

**Success Metrics (MVP):**
- DAU/MAU ratio > 30%
- Users log odometer at least once per week
- Users record service at least once per month
- 30-day retention rate > 25%
- Average session duration > 5 minutes

---

## 3. TARGET USERS

**Primary Personas:**
1. **Daily motorcycle commuters** - Use motorcycle for daily transportation to work/school
2. **Ride-hailing / delivery drivers** - Professional drivers with high mileage
3. **Students** - Budget-conscious users needing cost-effective maintenance
4. **Families owning multiple motorcycles** - Manage multiple vehicles efficiently

**Pain Points:**
1. Forgetting maintenance schedules
2. Lack of knowledge about service intervals
3. No maintenance history tracking
4. Lack of awareness of vehicle cost
5. Uncertainty about motorcycle health
6. Difficulty tracking fuel efficiency
7. No centralized record of repairs and services

**User Goals:**
- Maintain motorcycle reliability
- Reduce unexpected breakdowns
- Optimize maintenance costs
- Track vehicle expenses
- Get expert advice when needed

---

## 4. MVP PRODUCT SCOPE

MVP consists of three main pillars:
- **A. Maintenance Management** - Scheduling, tracking, and reminders
- **B. Financial & Fuel Tracking** - Cost analytics and fuel efficiency
- **C. AI Mechanic Assistant** - Condition analysis, repair recommendations (form-based)

**Out of Scope (Future Phases):**
- Workshop marketplace integration
- Spare parts ordering
- Mobile app (iOS/Android native)
- Social features / community
- Insurance integration

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 USER ACCOUNT

**Users must be able to:**
1. Register with email and password (with terms/privacy acceptance)
2. Login / Logout
3. Manage profile (name, email, phone number) and change password from profile
4. Reset password via email (forgot password flow)
5. *(Planned)* Register device for push notifications (web-based notifications)

**Validation Rules:**
- Email must be valid format
- Password minimum 8 characters
- Email must be unique

**Locale (implemented):** Users and guests can switch UI language (English / Bahasa Indonesia) via `/locale/{locale}`; preference stored in session.

### 5.2 GARAGE MANAGEMENT (Motorcycles)

**Users must be able to:**
1. Add motorcycle
2. Edit motorcycle details
3. Delete motorcycle (soft delete - preserve historical data)
4. View motorcycle summary/dashboard
5. Set default/active motorcycle
6. View list of all motorcycles

**Motorcycle Data Fields:**
1. Brand (required, from config `motorcycle_brands`)
2. Model (required, from config per brand)
3. Year (required, range: 1950-current year)
4. Engine CC (required, numeric)
5. License plate (optional, text)
6. Purchase date (optional, date)
7. Current odometer (required, numeric, >= 0)
8. Nickname/Name (optional, for user convenience)
9. Image (optional, photo of the motorcycle; single image upload)

**Business Rules:**
- Users can own multiple motorcycles (unlimited)
- Each motorcycle maintains independent maintenance schedules
- Soft delete preserves all historical data (services, fuel logs, odometer history)
- Current odometer must be >= last recorded odometer value

### 5.3 ODOMETER TRACKING

**Users must be able to:**
1. Add odometer log entry (date, odometer reading)
2. View odometer history (chronological list/chart)
3. Quick update current odometer (most recent entry)
4. Edit odometer entries (with validation)
5. Delete odometer entries (with validation)

**System must calculate:**
1. Daily distance traveled
2. Monthly distance traveled
3. Total distance since first entry
4. Average daily distance
5. Distance since last service

**Validation Rules:**
- Odometer value must be >= previous entry (no rollback allowed)
- Date must be >= previous entry date
- Maximum allowed gap: 50,000 km (to prevent data entry errors)

### 5.4 SMART MAINTENANCE SCHEDULE *(Planned – not yet implemented)*

**System automatically generates maintenance schedules based on:**
1. Kilometer interval (e.g., every 2,000 km)
2. Time interval (e.g., every 3 months)
3. Whichever comes first (time OR distance)

**Standard Maintenance Items (with default intervals):**
1. **Engine oil** - Every 2,000-3,000 km or 3 months
2. **Gear oil** - Every 5,000-10,000 km or 6 months
3. **Brake pads** - Every 10,000-15,000 km or 12 months
4. **Battery** - Every 12-24 months (time-based)
5. **Spark plug** - Every 10,000-15,000 km or 12 months
6. **Air filter** - Every 5,000-10,000 km or 6 months
7. **Tire replacement** - Every 15,000-25,000 km or 24 months
8. **Chain & sprocket** - Every 15,000-20,000 km

**System must:**
1. Calculate `due_date` (based on last service date + time interval)
2. Calculate `due_odometer` (based on last service odometer + km interval)
3. Mark maintenance as "upcoming" (within 500 km or 7 days)
4. Mark maintenance as "overdue" (past due_date or due_odometer)
5. Reset schedule after service record (update last_service_date and last_service_odometer)
6. Allow users to customize intervals per motorcycle
7. Show maintenance status (upcoming/overdue/due soon)

**Business Logic:**
- Maintenance is due when EITHER time OR distance threshold is reached
- After service, reset both counters (date and odometer)
- Overdue items should be highlighted prominently

### 5.5 SERVICE HISTORY (Digital Logbook)

**Users must be able to:**
1. Record service entry
2. Edit service entry
3. Delete service entry (soft delete)
4. View service history (chronological list)
5. Filter/search services
6. Attach photos/receipts (optional, future phase)

**Service Entry Data Fields:**
1. Service date (required)
2. Odometer reading (required, must match or be >= last odometer entry)
3. Workshop name (optional, text)
4. Notes (optional, text area)
5. Service / labor cost (optional, numeric >= 0)
6. Replaced items (array: item name, quantity, unit cost, total cost; from predefined list or custom)
7. Total cost (required, numeric >= 0)
8. Service type (required: Regular Service, Repair, Emergency, Other)

**Replaced Items Structure:**
- Item name (e.g., "Engine Oil", "Brake Pads")
- Quantity
- Unit cost
- Total cost

**System must:**
1. Automatically update maintenance schedules after service record
2. Link service entries to maintenance items (mark as completed)
3. Calculate total service cost per motorcycle
4. Display service frequency statistics
5. Show next service due date based on last service

### 5.6 FUEL TRACKER *(Implemented)*

**Users must be able to:**
1. Log fuel refill entry
2. Edit fuel entry
3. Delete fuel entry
4. View fuel history (chronological list)
5. Mark as "full tank" or "partial fill"

**Fuel Entry Data Fields:**
1. Refill date (required)
2. Liters (derived from total price and price per liter when both provided)
3. Total price (required or derived from liters × price per liter)
4. Price per liter (optional; user can enter total price + price per liter and system calculates liters)
5. Odometer reading (required)
6. Fuel provider (optional; e.g. Pertamina, Shell, BP, Other — from config)
7. Fuel type (optional; per-provider types, e.g. Pertalite, Pertamax, from config/fuel_providers.php)
8. Station name (optional)

**System must calculate:**
1. Fuel consumption (km/l) - distance between refills / liters consumed *(only between full-tank refills)*
2. Monthly fuel cost (sum of all refills in month)
3. Yearly fuel cost
4. Cost per km (total fuel cost / total distance from odometer)
5. Average fuel consumption (overall, from full-tank segments)
6. Fuel cost trends (month-over-month comparison) *(optional, future)*

**Business Rules:**
- Calculate consumption only between consecutive "full tank" refills
- Partial fills should not affect consumption calculation
- Price per liter = Total price / Liters
- User may enter any two of: total price, price per liter, liters; system derives the third

### 5.7 COST ANALYTICS ✅ IMPLEMENTED (MVP 7)

**System must display:**
1. ✅ Monthly cost (current month and historical months) - Last 12 months
2. ✅ Yearly cost (current year and historical years) - Last 5 years
3. ✅ Cost per km (overall and per period)
4. ✅ Total cost of ownership (since first entry)
5. ✅ Cost trends (charts/graphs) - Monthly stacked bar chart, yearly bar chart, breakdown donut chart

**Cost Breakdown Categories:**
1. ✅ Service costs (from service history)
2. ⏳ Spare parts costs (from service history - replaced items) - Future enhancement
3. ✅ Fuel costs (from fuel tracker)
4. ⏳ Other costs (optional category for future expansion)

**Analytics Features:**
- ✅ Monthly cost trend chart (stacked bar: service + fuel)
- ✅ Yearly cost trend chart (bar chart)
- ✅ Cost per category breakdown (donut chart: service vs fuel)
- ✅ Average monthly/yearly spending
- ✅ Projected annual cost based on current spending rate
- ✅ Summary cards (total cost, cost per km, service cost, fuel cost, averages, projection)
- ✅ Recommendations when data is missing (odometer, service, fuel)

**Implementation:** Analytics tab on garage show page. Real-time calculation. Recommendations guide users to add missing data.

### 5.8 REMINDER & NOTIFICATION

**System must show notifications for:**
1. Upcoming maintenance (within 7 days or 500 km)
2. Overdue maintenance (past due date/odometer)
3. Weekly odometer reminder (if no entry in 7 days)
4. New AI insights available
5. Service milestone reminders (e.g., "Time for major service")

**Notification Types:**
- In-app notifications (badge count, notification center)
- Email notifications (optional, user preference)
- Browser push notifications (web-based, requires permission)

**Notification Settings:**
- Users can enable/disable notification types
- Users can set notification frequency preferences

### 5.8a AI MOTORCYCLE CONDITION ANALYSIS ✅ IMPLEMENTED (MVP 8a)

**Purpose:** One-shot AI analysis of motorcycle condition using odometer, service history, and fuel data. Form-triggered (no chat).

**Users can:**
1. Open AI Analysis from motorcycle detail (tab or dedicated page `/motorcycles/{id}/analysis`)
2. Run analysis (button); AI returns text summary and recommendations
3. View latest analysis with timestamp; regenerate as needed

**Implementation:** `MotorcycleAnalysis` model stores `analysis_text`, `generated_at`. `MotorcycleConditionAnalyzer` service uses configured LLM (OpenRouter/Ollama/HuggingFace). Results shown on analysis page and in “AI Analysis” tab on garage show.

### 5.9 REPAIR MODULE (AI RECOMMENDATIONS) ✅ IMPLEMENTED (MVP 8b)

**Purpose:** Let users report when their motorcycle feels off or not usual; AI returns actionable recommendations. Form-based (no chat).

**Users can:**
1. Submit a description of what feels wrong or unusual (e.g. strange noise, vibration, poor braking, starting issues)
2. Select the motorcycle (if they have more than one)
3. Receive AI-generated recommendations on what to do, based on their input and motorcycle context

**Input (form):**
- Motorcycle (pre-selected on motorcycle detail page, or dropdown if from dashboard)
- User description (required): free text — symptoms, when it happens, how long, etc.
- Optional: odometer at time of issue (defaults to current)

**AI Context (must consider):**
- User’s description (primary)
- Motorcycle data (brand, model, year, CC, current odometer)
- Recent service history (last service, type, items replaced)
- Recent odometer/fuel context if relevant
- No conversation history (single request/response per submission)

**AI Output:**
- Clear, actionable recommendations (what to check, what to do, when to see a workshop)
- Plain language; Indonesian language support
- Reference to the user’s motorcycle and description where relevant
- Optional: suggest recording a service after repair

**Technical Requirements:**
- Form-based UI only (no chat interface)
- Single submit → one AI response (no multi-turn conversation)
- ✅ Rate limiting per user (10 submissions per hour)
- ✅ Reuse existing LLM integration (OpenRouter/Ollama/HuggingFace); store response per submission (RepairRecommendation model)
- ✅ Response time target: < 30 seconds
- ✅ History tracking (latest recommendation displayed with timestamp)

### 5.10 MOTOR HEALTH SCORE ✅ IMPLEMENTED (MVP 9)

**System calculates health score (0-100) based on:**
- ✅ **Overdue maintenance** (major impact: -20 points per overdue critical item, max -60)
- ✅ **Service frequency** (positive impact: +5 to +15 points based on km per service)
- ✅ **Component age** (negative impact: -5 to -20 points for components past recommended replacement)
- ✅ **Service history quality** (positive impact: +5 to +10 points for detailed records)
- ✅ **Odometer tracking consistency** (positive impact: +5 to +10 points for regular updates)
- ✅ **Fuel consumption anomalies** (negative impact: -5 to -15 points for sudden drops)

**Score Breakdown:**
- ✅ 90-100: Excellent - Well maintained (green)
- ✅ 70-89: Good - Minor attention needed (blue)
- ✅ 50-69: Fair - Maintenance due soon (yellow)
- ✅ 30-49: Poor - Maintenance overdue (red)
- ✅ 0-29: Critical - Immediate attention required (dark)

**System must:**
1. ✅ Display health score prominently on motorcycle dashboard - "Health score" tab on garage show page
2. ✅ Generate explanation text (rule-based) describing score factors
3. ✅ Provide recommendations to improve score (when data missing or issues found)
4. ✅ Update score in real-time as data changes (calculated on-demand)
5. ⏳ Show score history over time (trend chart) - Future enhancement (model ready)

**Implementation:** Health Score tab on garage show page. Real-time calculation with detailed factor breakdown. Color-coded score display with progress bar. Recommendations guide users to add missing data or address issues.

### 5.11 AI INSIGHTS *(Planned – not yet implemented)*

**System generates automatic insights (background job, daily):**
1. **Overdue maintenance alerts** - Critical items that need immediate attention
2. **Rising cost warnings** - Unusual spending patterns detected
3. **Fuel consumption anomalies** - Sudden changes in fuel efficiency
4. **Service interval recommendations** - Based on usage patterns
5. **Cost-saving opportunities** - Suggestions to reduce maintenance costs
6. **Maintenance pattern analysis** - Frequency and timing insights

**Insight Display:**
- Show on dashboard as cards/widgets
- Mark as read/unread
- Allow dismissal
- Link to relevant data/actions
- Timestamp for when insight was generated

### 5.12 DICTIONARY *(Implemented)*

**Purpose:** Store terms with descriptions and optional images (e.g. spare parts glossary). Entries are owned by user; admin can manage all.

**User role:**
1. View list of own dictionary entries (card grid: image + title)
2. View dictionary entry detail (show)
3. Create, edit, delete own entries (policy: owner or admin)

**Admin role:**
1. View list of all entries in DataTable (manage) with search/sort; sidebar links to Manage
2. Create, edit, delete any dictionary entry
3. View any entry detail (show, with Edit)

**Dictionary Entry Data Fields:**
1. Text / title (required, string)
2. Description (optional, text)
3. Image (optional, single image upload; JPEG/PNG/GIF/WebP, max 2 MB)

**Business Rules:**
- User: sees own entries in card grid (index); can create/edit/delete own entries.
- Admin: sidebar shows Dictionary → Manage (DataTable of all entries); full CRUD on any entry.
- Image stored under storage (e.g. storage/app/public/dictionaries)
- Hard delete with image file removal

---

### 5.13 ROLES & ADMIN *(Implemented)*

**Purpose:** Separate admin and regular user capabilities. Admin can view all users and their garages and manage dictionary content.

**User role:**
- View and manage only their own garage (motorcycles, odometer, services, fuel).
- View dictionary (card list and detail only; no create/edit/delete or manage table).

**Admin role:**
- Everything a user can do on their own data.
- View list of all users (name, email, phone, role, motorcycle count).
- View any user’s garage (read-only list of motorcycles).
- Full CRUD on dictionary (manage table, create/edit/delete entries; can manage all users’ entries).

**Implementation:**
- `users.role`: string, values `user` | `admin`, default `user`.
- Middleware: only users with `role === 'admin'` can access admin routes and dictionary manage/create/edit/delete.
- Default admin: seeder creates/updates one admin user (configurable via ADMIN_EMAIL, ADMIN_PASSWORD in .env).

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance
- API response time < 500 ms (for non-AI endpoints, 95th percentile)
- AI responses handled asynchronously via queue (background processing)
- Page load time < 2 seconds (first contentful paint)
- Database query optimization (indexes on frequently queried fields)
- Support for 1,000+ concurrent users (MVP scale)

### 6.2 Security
- Session-based authentication (Laravel); no JWT in current web app
- Password hashing (Laravel bcrypt/argon2)
- HTTPS/TLS recommended for production
- AI repair endpoint rate limiting (10 requests/user/hour)
- Odometer validation (prevent rollback, max gap 50,000 km)
- Input validation and sanitization (Laravel validation; prevent SQL injection, XSS)
- CSRF protection (Laravel `@csrf`)
- Session management and timeout
- Policy-based authorization (e.g. Motorcycle, Dictionary)

### 6.3 Scalability
- Horizontal scaling via Docker containers
- Container orchestration (Docker Compose for MVP, Kubernetes/OKD for production)
- Queue-based background jobs (for AI processing, notifications, insights)
- Database connection pooling
- Caching strategy (Redis for session and frequently accessed data)
- CDN for static assets (future phase)

### 6.4 Availability
- Target uptime: 99% (allows ~7.2 hours downtime/month)
- Database backups: Daily automated backups
- Disaster recovery plan: RTO < 4 hours, RPO < 24 hours
- Health check endpoints for monitoring
- Error logging and monitoring (Sentry or similar)

### 6.5 Usability
- Responsive design (mobile, tablet, desktop)
- Support for Indonesian language (Bahasa Indonesia)
- Intuitive navigation (maximum 3 clicks to reach any feature)
- Accessible design (WCAG 2.1 Level AA compliance)
- Progressive Web App (PWA) capabilities for mobile-like experience

### 6.6 Data Management
- Data retention: Indefinite (user data preserved unless deleted)
- GDPR compliance: User data export and deletion capabilities
- Data privacy: User data not shared with third parties without consent
- Audit logging: Track important user actions (service records, odometer updates)

### 6.7 Browser Compatibility
- Modern browsers: Chrome, Firefox, Safari, Edge (last 2 versions)
- Mobile browsers: Chrome Mobile, Safari Mobile
- Graceful degradation for older browsers

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Technology Stack *(Current implementation)*

**Frontend:**
- Server-rendered Blade views (Laravel)
- UI: Sneat theme (Bootstrap-based)
- Charts: ApexCharts (e.g. analytics, dashboard)
- Localization: Laravel lang (EN/ID), `__('ui.*')` for UI strings

**Backend:**
- Framework: Laravel (PHP)
- Database: MySQL or SQLite
- ORM: Eloquent
- File Storage: Local `storage/app/public` (motorcycles, dictionaries)
- Config: `config/fuel_providers.php`, `config/motorcycle_brands.php`, `config/ai.php`

**AI/ML:**
- LLM: OpenRouter, Ollama, or Hugging Face Inference (configurable via `AI_DRIVER` in .env)
- No vector DB or chat; form-based analysis and repair recommendations only

**DevOps:**
- Containerization: Docker (optional; see deployment docs)
- Queue/cache: Laravel queue and cache (optional for background jobs)

### 7.2 System Architecture

**Architecture Pattern:** Laravel MVC, server-rendered web application (no separate SPA or REST API for main flows).

**Key Components:**
1. **Web application** - Blade views, controllers, form submissions
2. **Models** - User, Motorcycle, OdometerLog, ServiceRecord, ServiceItem, FuelLog, Dictionary, MotorcycleAnalysis, RepairRecommendation; MotorHealthScore table for future history
3. **Services** - HealthScoreService, MotorcycleConditionAnalyzer, RepairRecommendationService (LLM calls)
4. **Database** - MySQL/SQLite
5. **Auth** - Laravel session-based authentication; `admin` middleware for admin routes

**Data Flow:**
- User → Browser → Laravel routes → Controllers → Models → Database
- AI features: Controller → Service → LLM API → Store result in DB → Redirect/display

---

## 8. DATA MODELS

### 8.1 Core Entities *(as implemented)*

**User**
- id, email, password (hashed), name, phone, role (user|admin, default user), created_at, updated_at

**Motorcycle**
- id, user_id, brand, model, year, engine_cc, license_plate, purchase_date, current_odometer, nickname, image (nullable, path), is_active, deleted_at, created_at, updated_at

**OdometerLog**
- id, motorcycle_id, odometer, date, distance_since_last, created_at

**MaintenanceItem** *(planned – not implemented; for MVP 6)*
- Would hold: motorcycle_id, item_name, intervals, last_service_date/odometer, due_date, due_odometer, status

**ServiceRecord**
- id, motorcycle_id, service_date, odometer, workshop_name, notes, service_cost (labor), total_cost, service_type, created_at, updated_at, deleted_at

**ServiceItem** (replaced items in service)
- id, service_record_id, item_name, quantity, unit_cost, total_cost (predefined part names or custom)

**FuelLog**
- id, motorcycle_id, refill_date, liters, total_price, odometer, fuel_provider, fuel_type, station_name, is_full_tank, created_at, updated_at

**Dictionary**
- id, user_id, text, description, image (nullable, path), created_at, updated_at

**MotorcycleAnalysis** (MVP 8a)
- id, motorcycle_id, analysis_text, generated_at

**RepairRecommendation** (MVP 8b)
- id, motorcycle_id, user_description, ai_response, created_at

**MotorHealthScore**
- id, motorcycle_id, score, explanation_text, factors_json, calculated_at (table exists; score currently calculated on-demand by HealthScoreService; table for future history/trend)

**AIInsight** *(planned – for MVP 10)*
- Would hold: motorcycle_id, insight_type, title, message, action_url, is_read, created_at

---

## 9. ROUTES & API

**Current implementation:** The application uses **Laravel web routes** (session-based). All main flows (auth, garage, odometer, services, fuel, dictionary, admin, analytics, health score, repair, AI analysis) are implemented as web routes and Blade views. The `routes/api.php` file is minimal (e.g. `GET /api/user` for authenticated API user). Future expansion may add REST API endpoints for mobile or third-party clients.

**Key web routes (examples):**
- Auth: `/login`, `/register`, `/password/reset`, `/logout`; profile: `/profile`, `/profile/password`
- Locale: `GET /locale/{locale}` (en|id)
- Garage: resource `motorcycles` (index, create, store, show, edit, update, destroy), `PUT /motorcycles/{id}/set-active`, `GET /motorcycles/models?brand=…`
- Odometer: `GET/POST /motorcycles/{id}/odometer`, `GET/PUT/DELETE /odometer/{id}`
- Services: `GET/POST /motorcycles/{id}/services`, `GET/PUT/DELETE /services/{id}`
- Fuel: `GET/POST /motorcycles/{id}/fuel`, `GET/PUT/DELETE /fuel/{id}`
- Dictionary: `GET dictionary`, `GET dictionary/manage` (admin), resource `dictionary` (create, store, show, edit, update, destroy)
- Admin: `GET admin/users`, `GET admin/users/{user}`
- AI: `POST /motorcycles/{id}/analysis` (condition analysis), `POST /motorcycles/{id}/repair` (repair recommendations)

**Optional future API:** If a REST API is added later, endpoints could follow the structure previously listed (auth, motorcycles, odometer, maintenance, services, fuel, analytics, health-score, AI, notifications).

---

## 10. UI/UX REQUIREMENTS

### 10.1 Design Principles
- Clean, modern, and intuitive interface
- Mobile-first responsive design
- Consistent color scheme and typography
- Clear visual hierarchy
- Accessible design (WCAG 2.1 AA)

### 10.2 Key Screens/Pages

**Dashboard:** *(Implemented)*
- Motorcycle overview; active bike highlighted
- Stats: motorcycle count, odometer entries, service records, fuel logs, total km, total service cost
- Recent services and fuel (last 5 each)
- Chart data (last 12 months: odometer, services, fuel, costs)
- Quick links to garage and data entry

**Motorcycle Detail:** *(Implemented)*
- Motorcycle info, image, current odometer; set active, edit, remove (soft delete)
- Tabs: Odometer, Services, Fuel, Analytics, Health Score, Repair, AI Analysis
- Latest odometer, service, fuel summary; full tables per tab
- Analytics: cost cards, monthly/yearly charts, breakdown donut, recommendations when data missing
- Health: score with color band, factor breakdown, recommendations
- Repair: form to submit “feeling off” description; latest AI recommendation with timestamp
- AI Analysis: link to dedicated analysis page; run/regenerate analysis; display latest result

**Maintenance Schedule:** *(Planned – MVP 6)*
- List of all maintenance items with status (due/upcoming/overdue)
- Filter and sort options; optional calendar view

**Service History:**
- Chronological list of services
- Service details modal
- Cost breakdown
- Filter by date range, service type

**Fuel Tracker:**
- Fuel log entries (table, Rp display)
- Add fuel entry form (date; total price, price per liter, liters; provider + type; station; full tank)
- Stats: total cost, this month, avg consumption, cost per km
- Consumption chart / cost trends *(optional, future)*

**Dictionary:**
- Dictionary list (table with image thumb, text, description excerpt)
- Add/Edit entry form (text, description, image upload)
- Entry detail view (image, text, description)

**Analytics:**
- Cost charts (monthly/yearly)
- Fuel consumption trends
- Cost breakdown by category
- Comparison views

**AI features (no chat):**
- **Condition Analysis:** Dedicated page + tab; button to run/regenerate; display latest analysis text and timestamp
- **Repair recommendations:** Form on motorcycle detail (tab); single submit → one AI response; history shows latest recommendation

### 10.3 User Flows

**Primary Flows (implemented):**
1. Onboarding: Register (with terms) → Add Motorcycle (brand/model from config) → Add Odometer / Service / Fuel as needed
2. Daily: Dashboard → Garage → Motorcycle detail → Odometer / Services / Fuel tabs
3. Service: Record Service (with labor cost and replaced items) → View in Services tab
4. Fuel: Log Fuel (provider/type from config, full/partial tank) → View in Fuel tab; consumption between full tanks
5. Analytics & Health: Motorcycle detail → Analytics tab (cost charts, recommendations) and Health Score tab
6. AI: Motorcycle detail → Repair tab (submit description, get recommendation) or AI Analysis tab / page (run condition analysis)
7. Dictionary: Users browse/edit own entries; Admin uses Manage (DataTable) and CRUD any entry

---

## 11. TESTING REQUIREMENTS

### 11.1 Testing Strategy
- Unit tests: Core business logic (target: 80% code coverage)
- Integration tests: API endpoints
- E2E tests: Critical user flows
- Performance tests: Load testing for API endpoints
- Security tests: Authentication, authorization, input validation

### 11.2 Test Scenarios (Key)

**User Account:**
- Registration with valid/invalid data
- Login/logout flow
- Password reset flow

**Motorcycle Management:**
- Add/edit/delete motorcycle
- Odometer validation (prevent rollback)
- Multiple motorcycles management

**Maintenance:**
- Schedule calculation (time and distance)
- Overdue detection
- Schedule reset after service

**Data Integrity:**
- Odometer cannot decrease
- Service date validation
- Cost calculations accuracy

---

## 12. DEPLOYMENT & DEVOPS

### 12.1 Environment Setup
- **Development:** Local development environment
- **Staging:** Pre-production testing environment
- **Production:** Live application environment

### 12.2 Deployment Process
- Automated CI/CD pipeline
- Database migrations (version controlled)
- Zero-downtime deployment strategy
- Rollback capability

### 12.3 Monitoring & Logging
- Application performance monitoring
- Error tracking and alerting
- User analytics (privacy-compliant)
- Server resource monitoring
- Database performance monitoring

### 12.4 Backup & Recovery
- Daily automated database backups
- Backup retention: 30 days
- Tested recovery procedures
- Disaster recovery plan documented

---

## 13. RISK ASSESSMENT

### 13.1 Technical Risks
- **AI API costs** - Mitigation: Rate limiting, caching, optimize prompts
- **Data accuracy** - Mitigation: Input validation, user education
- **Scalability** - Mitigation: Design for horizontal scaling from start
- **Third-party dependencies** - Mitigation: Abstract integrations, have fallbacks

### 13.2 Business Risks
- **Low user adoption** - Mitigation: Focus on MVP, gather feedback early
- **Data privacy concerns** - Mitigation: Transparent privacy policy, secure implementation
- **Competition** - Mitigation: Focus on unique AI features and user experience

---

## 14. FUTURE ENHANCEMENTS (POST-MVP)

1. Mobile native apps (iOS/Android)
2. Workshop marketplace integration
3. Spare parts ordering
4. Social features / community
5. Insurance integration
6. Multi-language support expansion
7. Advanced analytics and reporting
8. Export data (PDF reports, CSV)
9. Integration with motorcycle manufacturers' APIs
10. Predictive maintenance using ML models

---

## APPENDIX

### A. Glossary
- **DAU/MAU:** Daily Active Users / Monthly Active Users ratio
- **RTO:** Recovery Time Objective
- **RPO:** Recovery Point Objective
- **PWA:** Progressive Web App

### B. References
- Motorcycle maintenance best practices
- Indonesian motorcycle market data
- Industry standards for vehicle maintenance tracking

---

**Document Status:** Aligned with current implementation (Laravel Blade web app).  
**Next Steps:** MVP 6 (Smart Maintenance Schedule), MVP 10 (AI Insights), Notifications, optional REST API for mobile.
