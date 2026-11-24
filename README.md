# NexusCRM Backend API (Node.js + Express + TypeScript + MongoDB & Mongoose)

Production-grade, enterprise RESTful backend API for **NexusCRM** built with **Node.js**, **Express**, **TypeScript**, and **Mongoose ODM** running against **MongoDB**.

---

## 🏗 Architecture & Design Patterns

The backend follows a strict **Layered Architecture (Separation of Concerns)**:

```
server/
├── src/
│   ├── config/              # Environment config validation (Zod) & Mongoose connection
│   ├── constants/           # HTTP Status codes and constants
│   ├── controllers/         # Thin HTTP layer: Request unpacking & response formatting
│   ├── middlewares/         # JWT Auth, Zod Validation, Central Error & 404 Handlers
│   ├── models/              # Mongoose Schemas & TypeScript interfaces
│   ├── routes/              # Modular Express Routers (/api/leads, /api/deals, etc.)
│   ├── services/            # Pure Business Logic & Multi-Entity Operations
│   ├── types/               # Domain enums & shared type declarations
│   ├── utils/               # ApiError, ApiResponse, asyncHandler, logger
│   ├── validators/          # Type-safe Zod validation schemas
│   ├── app.ts               # Express configuration (Helmet, CORS, Rate Limiters)
│   ├── seed.ts              # Database seeder matching frontend CRM seed dataset
│   └── server.ts            # Server bootstrap & graceful process shutdown
```

---

## 🗄 Database Schema & Relationships (MongoDB / Mongoose)

- **`User`**: System authentication with bcrypt & JWT (`ADMIN`, `MANAGER`, `SALES_REP`).
- **`Company`**: Enterprise accounts linked to multiple Contacts and Deals.
- **`Contact`**: Stakeholders linked to Company, Deals, Tasks, Tickets, and Activity touchpoints. Lifecycle stages: `LEAD`, `SALES_QUALIFIED`, `CHAMPION`, `CUSTOMER`.
- **`Lead`**: Inbound leads (`NEW`, `QUALIFIED`, `DISQUALIFIED`). Supports atomic conversion to Company + Contact + Activity note.
- **`Deal`**: Sales pipeline deals (`NEW`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`). Auto-generates Draft Quote on `PROPOSAL`.
- **`Quote`**: Proposals linked to Deals. Accepting a quote automatically advances Deal to `WON` and Contact to `CUSTOMER`.
- **`Task`**: Due-date actionable items linked to contacts and deals.
- **`Ticket`**: Support issues (`LOW`, `MEDIUM`, `HIGH` priority).
- **`Activity`**: Audit trail and chronological touchpoints (`CALL`, `EMAIL`, `MEETING`, `NOTE`).

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (name, email, password, role) |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user |

### 🏢 Companies (`/api/companies`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/companies` | List all companies with contact/deal counts |
| `GET` | `/api/companies/:id` | Get single company with linked contacts & deals |
| `POST` | `/api/companies` | Create new company |
| `PUT` | `/api/companies/:id` | Update company details |
| `DELETE` | `/api/companies/:id` | Delete company |

### 👥 Contacts (`/api/contacts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/contacts` | List contacts with company details |
| `GET` | `/api/contacts/:id` | Full contact drawer profile (company, deals, tasks, tickets, timeline) |
| `POST` | `/api/contacts` | Create contact |
| `PUT` | `/api/contacts/:id` | Update contact |
| `PATCH` | `/api/contacts/:id/lifecycle` | Update lifecycle stage (`LEAD`, `SALES_QUALIFIED`, `CHAMPION`, `CUSTOMER`) |
| `DELETE` | `/api/contacts/:id` | Delete contact |

### 🎯 Leads (`/api/leads`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | List inbound leads |
| `POST` | `/api/leads` | Create inbound lead |
| `PUT` | `/api/leads/:id` | Update lead |
| `DELETE` | `/api/leads/:id` | Delete lead |
| `POST` | `/api/leads/:id/convert` | **Atomic Conversion**: Creates/links Company, creates Contact, marks Lead qualified, logs Activity |

### 💼 Deals (`/api/deals`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/deals` | List all pipeline deals |
| `GET` | `/api/deals/:id` | Get deal with quotes, tasks, and activities |
| `POST` | `/api/deals` | Create deal and log activity |
| `PUT` | `/api/deals/:id` | Update deal |
| `PATCH` | `/api/deals/:id/stage` | Update stage (auto-creates Quote draft if moved to `PROPOSAL`) |
| `DELETE` | `/api/deals/:id` | Delete deal |

### 📄 Quotes (`/api/quotes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/quotes` | List all proposals |
| `POST` | `/api/quotes` | Create proposal quote |
| `PATCH` | `/api/quotes/:id/status` | Update status (`DRAFT`, `SENT`) |
| `POST` | `/api/quotes/:id/accept` | **Accept Quote**: Sets Quote `ACCEPTED`, marks Deal `WON`, upgrades Contact to `CUSTOMER`, logs touchpoint |
| `DELETE` | `/api/quotes/:id` | Delete quote |

### 📅 Tasks, Tickets & Activities
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` / `POST` | `/api/tasks` | List / Create tasks |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle task completed status |
| `GET` / `POST` | `/api/tickets` | List / Open support tickets |
| `PATCH` | `/api/tickets/:id/status` | Change ticket status (`OPEN` / `CLOSED`) |
| `GET` / `POST` | `/api/activities` | List touchpoint timeline (filters: `?contactId=...&dealId=...`) / Log activity |

### 📊 Analytics & Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime and health status |
| `GET` | `/api/analytics/overview` | Pipeline value, win rate, stage breakdown, source breakdown, badges |

---

## 🚀 Setup & Execution

### 1. Configure MongoDB Connection
In `server/.env`, set your MongoDB connection URI (local or MongoDB Atlas):
```env
MONGODB_URI="mongodb://127.0.0.1:27017/nexus_crm"
```

### 2. Seed Initial Demo Data
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on: **`http://localhost:5000`**
Health check: **`http://localhost:5000/api/health`**

