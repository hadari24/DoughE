# Dough-E

A full-stack web application for browsing, managing, rating, and discussing dough recipes.
Users log in, browse recipes (cards or a sortable table), open a recipe to see ingredients
and steps, chat about it in **real time**, rate it with stars, like recipes to save them to
their profile, and ask an **AI baking assistant** for help.

**Authors:** Hadar Ofer & Shir Battat
**Course:** Internet Development Environments — Assignment 4

---

## Tech stack

- **Frontend:** React (Create React App), React Router, Axios, socket.io-client
- **Backend:** Node.js, Express
- **Database:** MySQL
- **ORM:** Sequelize
- **Real-time:** Socket.IO
- **AI:** Groq (OpenAI-compatible API; swappable)

---

## Project structure

```
DoughE/
├── backend/
│   ├── .env.example              # environment template (copy to .env)
│   ├── package.json              # backend deps + scripts (start / dev / seed)
│   ├── migrations/
│   │   └── schema.sql            # MySQL schema (all tables + relationships)
│   ├── models/                   # Sequelize models + associations
│   │   ├── index.js              # connection + ALL relationships
│   │   ├── user.js  admin.js  recipe.js
│   │   ├── ingredient.js  recipeIngredient.js   # ingredients junction (M:N)
│   │   ├── recipeLike.js                        # likes junction (M:N)
│   │   └── comment.js
│   └── src/
│       ├── server.js             # Express + Sequelize + Socket.IO + AI entry point
│       ├── middleware/           # auth (role check), logger, errorHandler
│       ├── utils/response.js     # success() / error() envelope helpers
│       ├── routes/               # users, recipes, auth, settings, likes, ai
│       ├── controllers/          # users, recipes, comments, likes, ai
│       ├── socket/index.js       # Socket.IO events (live comments + presence)
│       └── seed/seed.js          # sample data loader
└── frontend/                     # React frontend
    └── src/
        ├── pages/                # Login, Dashboard, Profile, Settings
        ├── components/           # RecipeCard, RecipeComments, ChatWidget, ...
        └── services/             # api, auth, recipes, likes, settings, socket, ai
```

---

## Installation

### Prerequisites
- Node.js 18+ (needed for the backend's built-in `fetch`)
- MySQL 8+ (with MySQL Workbench recommended)

### 1. Database setup
Create the database and tables by running the schema in MySQL Workbench
(**File → Open SQL Script →** `backend/migrations/schema.sql` **→ Execute**), or from a shell:

```bash
mysql -u root -p < backend/migrations/schema.sql
```

This creates the `doughe` database with all seven tables.

### 2. Environment variables
```bash
cd backend
cp .env.example .env
```
Then edit `backend/.env` (see the table below) — set `DB_PASSWORD` and `GROQ_API_KEY`.

### 3. Backend
```bash
cd backend
npm install
npm run seed      # builds tables from the models + inserts sample data
npm start         # http://localhost:3000
```
On success the console prints `MySQL connection OK.` and
`Dough-E API + Socket.IO running on http://localhost:3000`.

### 4. Frontend
```bash
cd frontend
npm install
npm start         # choose "Y" to run on port 3001 when prompted
```
Open **http://localhost:3001** and log in (e.g. `hadar@dough.com` / `123456`).

---

## Environment variables (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend port | `3000` |
| `CLIENT_ORIGIN` | Frontend origin (CORS) | `http://localhost:3001` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `doughe` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(your password)* |
| `GROQ_API_KEY` | AI provider key (backend only) | `gsk_...` |

`.env` is git-ignored; only `.env.example` (no secrets) is committed.

---

## ORM setup (Sequelize)

Models live in `backend/models/`. `models/index.js` creates the connection from `.env`
and defines every relationship. On startup the server calls `sequelize.sync()` (no `force`),
so tables are created if missing and existing data is preserved across restarts.

**Models:** `User`, `Admin`, `Recipe`, `Ingredient`, `RecipeIngredient` (junction),
`RecipeLike` (junction), `Comment`.

**Relationships:**
- **One-to-one:** `User` ↔ `Admin`
- **One-to-many:** `User` → `Recipe` (author); `Recipe` → `Comment`; `User` → `Comment`
- **Many-to-many:** `Recipe` ↔ `Ingredient` (through `recipe_ingredients`);
  `User` ↔ `Recipe` likes (through `recipe_likes`)
- **JOIN example:** `GET /api/recipes/:id` returns a recipe with its author and all
  ingredients (Sequelize `include`).

To reset the schema and sample data at any time: `npm run seed` (drops and recreates all
tables — dev only).

---

## API endpoints

Base URL: `http://localhost:3000`. All responses use the standard envelope (below).
Role is simulated via an `x-user-role` header; the current user via `x-user-id`.

### Auth
| Method | Path | Body / Headers |
|--------|------|----------------|
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | — |
| GET | `/api/auth/me` | header `x-user-id` |

### Users
| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/api/users` | admin/manager/user | — |
| GET | `/api/users/:id` | admin/manager/user | — |
| POST | `/api/users` | admin | `{ firstName, lastName, userRole, email, password }` |
| PUT | `/api/users/:id` | admin/manager, or the user themselves (`x-user-id`) | `{ firstName, lastName, userRole }` |
| DELETE | `/api/users/:id` | admin | — |

### Recipes
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/recipes` | public | filters: `?difficulty=`, `?doughFamily=` |
| GET | `/api/recipes/:id` | public | JOIN: author + ingredients |
| POST | `/api/recipes` | admin/manager | `{ title, doughFamily, hydration, difficulty, totalTimeMinutes, steps, ingredients:[{name,amount,unit}] }` |
| PUT | `/api/recipes/:id` | admin/manager | partial fields |
| DELETE | `/api/recipes/:id` | admin | — |

### Comments (real-time; REST read)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/recipes/:id/comments` | list saved comments (with ratings) |

### Likes
| Method | Path | Headers |
|--------|------|---------|
| POST | `/api/recipes/:id/like` | `x-user-id` |
| DELETE | `/api/recipes/:id/like` | `x-user-id` |
| GET | `/api/likes` | `x-user-id` → the user's liked recipes |

### Settings
| Method | Path | Headers / Body |
|--------|------|----------------|
| GET | `/api/settings` | header `x-user-id` |
| PUT | `/api/settings` | header `x-user-id`, body `{ userName, email, theme }` |

### AI
| Method | Path | Body |
|--------|------|------|
| POST | `/api/ai/assistant` | `{ prompt, context? }` |

### Response format
```json
// success
{ "success": true, "data": { }, "error": null }

// error
{ "success": false, "data": null, "error": { "code": "SOME_CODE", "message": "…", "details": {} } }
```

---

## WebSocket feature (Socket.IO)

**Live recipe comments + presence.** When a user opens a recipe, the client joins that
recipe's room; comments posted by anyone in the room appear instantly for everyone, and are
**saved to MySQL** so they persist. A live "online" counter shows connected clients.

Custom events (beyond `connect` / `disconnect`), in `backend/src/socket/index.js`:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `recipe:join` | client → server | join a recipe's room |
| `comment:new` | client → server | post a comment (with optional star rating) |
| `comment:added` | server → clients | broadcast the saved comment to the room |
| `presence:update` | server → clients | number of connected clients |

**To demo:** open the same recipe in two browser tabs and post a comment in one — it appears
in both instantly. Reload afterward: the comments are still there (loaded from the database).

The frontend UI is `client/src/components/RecipeComments.jsx`, shown inside each recipe pop-up,
including a star-rating picker and an average rating.

---

## AI feature

**"Ask the Chef"** — a floating chat assistant (bottom-right) powered by Groq. It answers
baking questions and, when a recipe is open, tailors its answer to that recipe (the current
recipe's details are sent as context).

- Endpoint: `POST /api/ai/assistant` (`backend/src/controllers/aiController.js`).
- The frontend calls **our backend**, never the AI provider directly
  (`client/src/services/aiService.js` → `client/src/components/ChatWidget.jsx`).
- The provider key lives only in `backend/.env` (`GROQ_API_KEY`) and is never exposed to the
  frontend, the bundle, or network traffic.

To switch providers (e.g. back to Google Gemini), change the request in `aiController.js` and
the key in `.env` — the frontend needs no changes.

---

## Known limitations

- **Auth is simulated.** There is no real login/JWT; role and identity are passed via the
  `x-user-role` / `x-user-id` headers, and passwords are stored in plain text (assignment scope).
- **Guest mode** cannot like recipes or be attributed as a comment author (no real user id).
- **`npm run seed`** uses `sync({ force: true })`, which drops and recreates all tables — it is
  for development/first-run only; do not run it if you want to keep existing data.
- **Presence count** is in-memory (not persisted) and counts all connected clients app-wide,
  not per-recipe viewers.
- The frontend has no admin UI for creating/editing recipes; those operations are done through
  the API (see the Postman collection in `docs/`).
