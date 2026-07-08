# Dough-E API

A backend API for managing dough recipes and users.  

**Authors:** Hadar Ofer & Shir Battat  
**Course:** Internet Development Environments — Assignment 2

---

## Setup & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```


### 3. Port & Base URL

- **Port:** `3000`
- **Base URL:** `http://localhost:3000`
- **API base path:** `/`

---

## Authentication

This API uses a mock role-based header — no real login required.  
Include this header on requests that require authorization:

```
x-user-role: admin
```

Available roles: `admin`, `manager`, `user`

| Role    | Allowed actions                                          |
|---------|----------------------------------------------------------|
| admin   | All actions on all resources                             |
| manager | Read + update on all resources; create recipes only      |
| user    | Read; update **their own** user record only              |

### Self-update (`x-user-id`)

A regular `user` may update **only their own** user record. To do this, send both headers:

```
x-user-role: user
x-user-id: <your own userId>
```

The `x-user-id` must match the `:id` in the route. `admin` and `manager` can update any user and do not need `x-user-id`.

---

## Assumptions

- **Data is in-memory.** All data resets when the server restarts. There is no database.
- **IDs are auto-incremented integers.** Recipe IDs start at 1 (seed data goes up to 6), new ones start at 7. User IDs start at 1 (seed data goes up to 5), new ones start at 6.
- **IDs are assigned by the server.** You cannot set an ID manually when creating a resource.
- **PUT for recipes is a partial update.** Only the fields you send will be updated; omitted fields remain unchanged.
- **PUT for users is a full update.** All three fields (`firstName`, `lastName`, `userRole`) are required.
- **Role validation:** `userRole` must be one of `admin`, `manager`, `user`.
- **No real authentication.** The `x-user-role` header is trusted as-is — this simulates auth for testing purposes.

---

## Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

---

## API Reference

---

### Recipes

> **Note:** GET endpoints for recipes are public to allow browsing without a header.
> User endpoints always require a role header.

---

#### GET /recipes — Get all recipes

No authentication required.

**Query parameters (all optional):**

| Parameter    | Type   | Description                          |
|--------------|--------|--------------------------------------|
| `search`     | string | Filter by title (partial match)      |
| `difficulty` | string | Filter by difficulty (`easy`, `medium`, `hard`) |
| `doughFamily`| string | Filter by dough family               |

**Example request:**
```
GET http://localhost:3000/recipes?difficulty=easy
```

**Example success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "recipeId": 1,
      "title": "Classic Pizza Dough",
      "doughFamily": "yeast-based",
      "hydration": 65,
      "difficulty": "easy",
      "totalTimeMinutes": 120,
      "ingredients": [
        { "name": "flour", "amount": 500, "unit": "g" },
        { "name": "water", "amount": 325, "unit": "ml" }
      ],
      "steps": ["Mix flour and salt", "Add water and yeast", "Knead 10 min"],
      "createDate": "2026-03-01T10:00:00Z",
      "updateDate": "2026-03-01T10:00:00Z"
    }
  ],
  "error": null
}
```

---

#### GET /recipes/:id — Get recipe by ID

No authentication required.

**Example request:**
```
GET http://localhost:3000/recipes/1
```

**Example success response (200):**
```json
{
  "success": true,
  "data": {
    "recipeId": 1,
    "title": "Classic Pizza Dough",
    "doughFamily": "yeast-based",
    "hydration": 65,
    "difficulty": "easy",
    "totalTimeMinutes": 120,
    "ingredients": [
      { "name": "flour", "amount": 500, "unit": "g" }
    ],
    "steps": ["Mix flour and salt", "Knead 10 min"],
    "createDate": "2026-03-01T10:00:00Z",
    "updateDate": "2026-03-01T10:00:00Z"
  },
  "error": null
}
```

**Example error response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "No recipe found with ID 999",
    "details": { "field": "id" }
  }
}
```

---

#### POST /recipes — Create a new recipe

**Required header:** `x-user-role: admin` or `x-user-role: manager`

**Request body (all fields required):**
```json
{
  "title": "New Bread",
  "doughFamily": "sourdough",
  "hydration": 70,
  "difficulty": "medium",
  "totalTimeMinutes": 200,
  "ingredients": [
    { "name": "flour", "amount": 500, "unit": "g" },
    { "name": "water", "amount": 350, "unit": "ml" }
  ],
  "steps": ["Mix", "Ferment", "Bake"]
}
```

**Example success response (201):**
```json
{
  "success": true,
  "data": { "recipeId": 7 },
  "error": null
}
```

**Example error response — missing field (400):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: title",
    "details": { "field": "title" }
  }
}
```

**Example error response — forbidden (403):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": { "yourRole": "user", "allowedRoles": ["admin", "manager"] }
  }
}
```

---

#### PUT /recipes/:id — Update a recipe (partial)

**Required header:** `x-user-role: admin` or `x-user-role: manager`

Only the fields you include will be updated. All fields are optional but at least one must be provided.

**Request body (example — partial update):**
```json
{
  "difficulty": "hard",
  "totalTimeMinutes": 300
}
```

**Example success response (200):**
```json
{
  "success": true,
  "data": { "recipeId": 1 },
  "error": null
}
```

**Example error response — not found (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "No recipe found with ID 999",
    "details": { "field": "id" }
  }
}
```

---

#### DELETE /recipes/:id — Delete a recipe

**Required header:** `x-user-role: admin`

**Example request:**
```
DELETE http://localhost:3000/recipes/1
```

**Example success response (200):**
```json
{
  "success": true,
  "data": { "recipeId": 1 },
  "error": null
}
```

**Example error response — forbidden (403):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": { "yourRole": "manager", "allowedRoles": ["admin"] }
  }
}
```

---

### Users

---

#### GET /users — Get all users

**Required header:** `x-user-role: admin`, `manager`, or `user`

**Example request:**
```
GET http://localhost:3000/users
```

**Example success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "firstName": "Hadar",
      "lastName": "Ofer",
      "userRole": "admin",
      "createDate": "2026-03-01T10:00:00Z",
      "updateDate": "2026-03-01T10:00:00Z"
    }
  ],
  "error": null
}
```

**Example error response — missing header (401):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing x-user-role header. Please provide your role.",
    "details": {}
  }
}
```

---

#### GET /users/:id — Get user by ID

**Required header:** `x-user-role: admin`, `manager`, or `user`

**Example request:**
```
GET http://localhost:3000/users/1
```

**Example success response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "firstName": "Hadar",
    "lastName": "Ofer",
    "userRole": "admin",
    "createDate": "2026-03-01T10:00:00Z",
    "updateDate": "2026-03-01T10:00:00Z"
  },
  "error": null
}
```

**Example error response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User with id 999 was not found",
    "details": { "id": 999 }
  }
}
```

---

#### POST /users — Create a new user

**Required header:** `x-user-role: admin`

**Request body (all fields required):**
```json
{
  "firstName": "Dana",
  "lastName": "Cohen",
  "userRole": "user"
}
```

`userRole` must be one of: `admin`, `manager`, `user`

**Example success response (201):**
```json
{
  "success": true,
  "data": {
    "userId": 6,
    "user": {
      "userId": 6,
      "firstName": "Dana",
      "lastName": "Cohen",
      "userRole": "user",
      "createDate": "2026-06-01T10:00:00Z",
      "updateDate": "2026-06-01T10:00:00Z"
    }
  },
  "error": null
}
```

**Example error response — missing fields (400):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: lastName, userRole",
    "details": { "missing": ["lastName", "userRole"] }
  }
}
```

---

#### PUT /users/:id — Update a user

**Required header:** `x-user-role: admin` or `x-user-role: manager`
A regular `user` may also update **their own** record by sending `x-user-role: user` **and** `x-user-id: <their id>` (must match `:id`). Otherwise they receive `403`.

**Request body (all fields required):**
```json
{
  "firstName": "Dana",
  "lastName": "Levi",
  "userRole": "manager"
}
```

**Example success response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 6,
    "user": {
      "userId": 6,
      "firstName": "Dana",
      "lastName": "Levi",
      "userRole": "manager",
      "createDate": "2026-06-01T10:00:00Z",
      "updateDate": "2026-06-01T11:00:00Z"
    }
  },
  "error": null
}
```

**Example error response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User with id 999 was not found",
    "details": { "id": 999 }
  }
}
```

---

#### DELETE /users/:id — Delete a user

**Required header:** `x-user-role: admin`

**Example request:**
```
DELETE http://localhost:3000/users/4
```

**Example success response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 4,
    "message": "User deleted"
  },
  "error": null
}
```

**Example error response — forbidden (403):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": { "yourRole": "manager", "allowedRoles": ["admin"] }
  }
}
```

---

## Project Structure

```
DoughE/
├── server.js                  # Entry point, middleware setup, route registration
├── middleware/
│   ├── auth.js                # requireRole() — role-based access control
│   ├── logger.js              # Logs every incoming request
│   └── errorHandler.js        # Global error handler (catches unhandled errors)
├── routes/
│   ├── recipes.js             # Recipe route definitions
│   └── users.js               # User route definitions
├── controllers/
│   ├── recipesController.js   # Recipe business logic
│   └── usersController.js     # User business logic
├── models/
│   ├── recipesData.js         # In-memory recipes data + CRUD functions
│   └── usersData.js           # In-memory users data + CRUD functions
├── utils/
│   └── response.js            # success() and error() response helpers
└── docs/
    ├── Dough-E API.postman_collection.json
    └── screenshots/
```

---

## Testing

Import `docs/Dough-E API.postman_collection.json` into Postman to get all endpoints pre-configured with example requests and saved responses.

Screenshots of representative success and error responses are in `docs/screenshots/`.
