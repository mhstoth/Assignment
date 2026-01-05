# discoverRegensburg

A full-stack Placemark application for discovering locations in Regensburg. Built with a **Hapi.js REST API** backend and a **SvelteKit** frontend.

## Features (Level 3)

### Backend (Hapi.js)
- **User Accounts**: Signup, Login with JWT Authentication
- **Password Security**: bcrypt hashing & salting
- **Placemark Management**: Full CRUD operations
- **Image Upload**: Cloudinary integration
- **REST API**: Fully documented with Swagger
- **Database**: MongoDB with Mongoose ODM

### Frontend (SvelteKit)
- **UI**
- **Dashboard**: Collapsible sections for Map, Form, and Placemarks
- **Interactive Map**: Leaflet with Category Layers
- **Analytics Charts**: svelte-frappe-charts for statistics
- **Admin Panel**: User management and analytics
- **Responsive Design**: Mobile-friendly layout

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Hapi.js |
| Frontend | SvelteKit, TypeScript, Svelte 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Maps | Leaflet |
| Charts | svelte-frappe-charts |
| Styling | Bulma CSS, Custom CSS |
| Images | Cloudinary |
| Icons | Font Awesome 5 |

## Quick Start


### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd Assignment_Level_3

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Cookie Authentication
COOKIE_NAME=discoverRegensburg
COOKIE_PASSWORD=your-secret-key-min-32-chars

# MongoDB
DB=mongodb://localhost/discoverRegensburg

# Cloudinary
cloud_name=your_cloud_name
api_key=your_api_key
api_secret=your_api_secret
```

Create a `.env` file in the `client/` directory:

```env
PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```
Backend runs at `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs at `http://localhost:5173`

## Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| `moritz@diehutzlers.de` | `1` | Admin |
| `jannis@diehutzlers.de` | `1` | User |

## API Documentation

Interactive Swagger documentation available at:
- Local: `http://localhost:3000/documentation`
- Production: `https://discover-regensburg-LEVEL-3.onrender.com/documentation`

### API Authentication

```bash
# 1. Get JWT token
POST /api/users/authenticate
Body: { "email": "moritz@diehutzlers.de", "password": "1" }

# 2. Use token in header
Authorization: Bearer <token>
```

## Project Structure

```
Assignment_Level_3/
├── src/                    # Hapi.js Backend
│   ├── api/               # REST API endpoints
│   ├── controllers/       # Web controllers
│   ├── models/            # Mongoose schemas
│   │   └── mongo/
│   │       └── seed-data.js  # Demo data
│   ├── views/             # Handlebars templates
│   └── test/              # Unit & API tests
│
├── client/                 # SvelteKit Frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts     # API client
│   │   │   ├── auth.ts    # Auth helpers
│   │   │   └── components/
│   │   │       ├── LeafletMap.svelte
│   │   │       └── Navigation.svelte
│   │   └── routes/
│   │       ├── +page.svelte      # Homepage
│   │       ├── login/
│   │       ├── signup/
│   │       ├── dashboard/        # Main app
│   │       ├── map/              # Full map view
│   │       └── admin/            # Admin panel
│   └── static/
│       └── favicon.png
│
└── package.json
```

## Running Tests

```bash
npm run test
```

## Deployment

- **Backend**: Render.com (Level 2 Requirement)
- **Frontend**: Local development (Deployment not required for Level 3)

Backend Production URL: `https://discover-regensburg-backend.onrender.com/`

## Level 3 Requirements Checklist

| Requirement | Feature | Status |
|-------------|---------|--------|
| **Charts** | Simple / Single Chart type | ✅ svelte-frappe-charts (Bar + Pie) |
| **Maps** | Maps with Layers (for categories) | ✅ Leaflet with LayerControl |
| **Images** | Single Images per POI | ✅ Cloudinary integration |
| **Authentication** | Hashing & salting passwords | ✅ bcrypt |
| **Architecture** | SvelteKit | ✅ SvelteKit + TypeScript |

## Author

Moritz Hutzler - OTH Regensburg, Full Stack Development WS 2025/26
