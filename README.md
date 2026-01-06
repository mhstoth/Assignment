# discoverRegensburg

A full-stack Placemark application for discovering locations in Regensburg. Built with a **Hapi.js REST API** backend and a **SvelteKit** frontend with **Server-Side Rendering (SSR)**.

## Features (Level 4)

### Backend (Hapi.js)
- **User Accounts**: Signup, Login with JWT Authentication
- **OAuth Authentication**: GitHub and Google OAuth integration
- **Password Security**: bcrypt hashing & salting
- **Placemark Management**: Full CRUD operations
- **Multi-Image Upload**: Multiple images per placemark with Cloudinary
- **REST API**: Fully documented with Swagger
- **Database**: MongoDB with Mongoose ODM
- **Server-Side Rendering**: Hybrid approach (Cookie + localStorage)

### Frontend (SvelteKit)
- **Dashboard**: Collapsible sections for Map, Form, and Placemarks with filtering
- **Multiple Maps**: Category-based mini-maps on map page
- **Interactive Maps**: Leaflet with Category Layers, unified orange markers
- **Rich Analytics Charts**: 5 chart types (Bar, Pie, Line, Area, Donut)
- **Image Gallery**: Carousel component with thumbnail navigation
- **OAuth Login**: GitHub and Google authentication
- **Admin Panel**: User management and comprehensive analytics
- **Server-Side Rendering**: Fast initial load with SSR

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Hapi.js |
| Frontend | SvelteKit, TypeScript, Svelte 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, OAuth 2.0 (GitHub, Google) |
| Maps | Leaflet |
| Charts | svelte-frappe-charts |
| Styling | Custom CSS (Apple-inspired design) |
| Images | Cloudinary |
| Icons | Font Awesome 5 |
| HTTP Client | @hapi/wreck |

## Quick Start


### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd Assignment_Level_3

# Install backend dependencies
cd src
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

# OAuth (GitHub)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `client/` directory:

```env
PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd src
npm run dev
```
Backend runs at `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs at `http://localhost:5173`

## Authentication

### Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| `moritz@diehutzlers.de` | `1` | Admin |
| `jannis@diehutzlers.de` | `1` | User |

### OAuth Authentication

Users can sign in using:
- **GitHub OAuth**: Click "Login with GitHub" on the login page
- **Google OAuth**: Click "Login with Google" on the login page

OAuth accounts are automatically created on first login. Existing email accounts can be linked to OAuth providers if the email matches.

## API Documentation

Interactive Swagger documentation available at:
- Local: `http://localhost:3000/documentation`

### API Authentication

#### Email/Password Authentication

```bash
# 1. Get JWT token
POST /api/users/authenticate
Body: { "email": "moritz@diehutzlers.de", "password": "1" }

# 2. Use token in header
Authorization: Bearer <token>
```

#### OAuth Authentication

```bash
# GitHub OAuth Flow
GET /api/auth/github
# Redirects to GitHub → User authorizes → Callback with token

# Google OAuth Flow
GET /api/auth/google
# Redirects to Google → User authorizes → Callback with token
```

### API Endpoints

#### Placemarks
- `GET /api/placemarks` - Get user's placemarks
- `GET /api/placemarks/admin/all` - Get all placemarks (admin only)
- `POST /api/placemarks` - Create placemark
- `PUT /api/placemarks/{id}` - Update placemark
- `DELETE /api/placemarks/{id}` - Delete placemark
- `POST /api/placemarks/{id}/uploadimages` - Upload multiple images
- `DELETE /api/placemarks/{id}/images/{imageUrl}` - Delete single image

#### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user
- `POST /api/users/authenticate` - Authenticate user

#### OAuth
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

## Project Structure

```
Assignment_Level_3_B/
├── src/                    # Hapi.js Backend
│   ├── api/               # REST API endpoints
│   │   ├── oauth-api.js   # OAuth handlers (GitHub, Google)
│   │   ├── placemark-api.js
│   │   └── user-api.js
│   ├── controllers/       # Web controllers
│   ├── models/            # Mongoose schemas
│   │   └── mongo/
│   │       ├── placemark.js  # Placemark schema (images[], createdAt)
│   │       ├── user.js       # User schema (OAuth fields)
│   │       └── seed-data.js  # Demo data
│   ├── views/             # Handlebars templates
│   └── test/              # Unit & API tests
│
├── client/                 # SvelteKit Frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.ts          # Auth helpers
│   │   │   ├── stores/
│   │   │   │   └── auth.ts     # Reactive auth store
│   │   │   └── components/
│   │   │       ├── LeafletMap.svelte
│   │   │       ├── MiniMap.svelte      # Category mini-maps
│   │   │       ├── ImageGallery.svelte # Image carousel
│   │   │       └── Navigation.svelte
│   │   └── routes/
│   │       ├── +page.svelte           # Homepage
│   │       ├── login/
│   │       │   ├── +page.svelte      # Login with OAuth buttons
│   │       │   └── +page.server.ts   # Form action (SSR)
│   │       ├── signup/
│   │       ├── dashboard/
│   │       │   ├── +page.svelte      # Dashboard with filtering
│   │       │   └── +page.server.ts   # SSR load
│   │       ├── map/
│   │       │   └── +page.svelte      # Map with category mini-maps
│   │       ├── admin/
│   │       │   ├── +page.svelte      # Admin with 5 chart types
│   │       │   └── +page.server.ts   # SSR load
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       ├── +page.svelte      # OAuth callback handler
│   │       │       └── +page.server.ts   # Token processing
│   │       └── logout/
│   │           ├── +page.svelte
│   │           └── +page.server.ts   # Cookie deletion
│   └── static/
│       └── favicon.png
│
└── package.json
```

## Key Features

### Multiple Chart Types
- **Bar Chart**: Placemarks leaderboard (top users)
- **Pie Chart**: Category distribution
- **Line Chart**: POIs created over time (last 6 months)
- **Area Chart**: Cumulative growth of placemarks
- **Donut Chart**: Image status (with/without images)

### Multiple Maps
- **Category Mini-Maps**: One map per category on `/map` page
- **Main Map**: Full-width map showing all placemarks
- **Unified Markers**: All maps use CI orange markers
- **Rich Popups**: Image previews, descriptions, coordinates

### Multiple Images per POI
- **Image Gallery**: Carousel component with thumbnail navigation
- **Multi-File Upload**: Upload multiple images at once
- **Individual Deletion**: Delete specific images from placemarks
- **Fallback Logo**: Shows logo when no images available

### OAuth Authentication
- **GitHub OAuth**: Sign in with GitHub account
- **Google OAuth**: Sign in with Google account
- **Account Linking**: OAuth accounts linked to existing email accounts
- **Seamless Flow**: Automatic user creation and token generation

### Server-Side Rendering (SSR)
- **Hybrid Approach**: Cookie for SSR + localStorage for UX
- **Fast Initial Load**: Data loaded server-side
- **Protected Routes**: Server-side authentication checks
- **Form Actions**: Server-side form processing for login

## Running Tests

```bash
npm run test
```

## Author
Moritz Hutzler - OTH Regensburg, Full Stack Development WS 2025/26
