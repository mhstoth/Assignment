# discoverRegensburg

![Build Status](https://github.com/mhstoth/Assignment/actions/workflows/ci.yml/badge.svg)

A full-stack Placemark Application designed to discover and manage locations in Regensburg.

## Deployment

The application is deployed live and accessible via the following services:

| Service | URL | Description |
|:--------|:----|:------------|
| **Frontend** | [https://discover-regensburg-frontend.onrender.com](https://discover-regensburg-frontend.onrender.com) | User Interface (SvelteKit) |
| **Backend** | [https://discover-regensburg-backend.onrender.com](https://discover-regensburg-backend.onrender.com) | REST API & Swagger Documentation |

---

## Features (Level 5)

This project has been developed through 5 implementation levels, resulting in a comprehensive feature set:

### Interactive Maps & Location
- **Leaflet Integration**: Interactive maps utilizing custom markers.
- **Category Layers**: Functionality to filter locations by category (Sightseeing, Restaurants, Bars, Clubs).
- **Mini-Maps**: Dedicated map previews for individual categories.
- **Geolocation**: Visualization of precise coordinates for every Placemark.

### Authentication & Security
- **Secure Authentication**: Signup and Login functionality using Email & Password (bcrypt hashing).
- **OAuth 2.0**: Integration with GitHub and Google for single sign-on.
- **Password Reset**: Secure email-based password reset flow using SMTP.
- **Role-Based Access Control**: Distinction between Admin and User roles with protected routes.
- **Security Audits**: Implementation of automated `npm audit` and vulnerability scanning.

### Rich Media & Analytics
- **Multi-Image Upload**: Support for uploading multiple images per location (Cloudinary integration).
- **Image Gallery**: Carousel component with thumbnail navigation.
- **Analytics Charts**: Data visualization using `svelte-frappe-charts` (Bar, Pie, Line, Area, Donut charts).

### CI/CD & Architecture
- **Automated Pipeline**: GitHub Actions workflow for Tests, Linting, and Builds.
- **Testing**: Comprehensive Unit, API, and Model test suites using Mocha/Chai.
- **Server-Side Rendering (SSR)**: SvelteKit SSR for optimized initial load and SEO.
- **REST API**: Fully documented Hapi.js API with Swagger UI.

---

## Tech Stack

### Frontend
- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript / JavaScript
- **Styling**: Custom CSS
- **Maps**: Leaflet.js
- **Charts**: svelte-frappe-charts

### Backend
- **Framework**: Hapi.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: `hapi-auth-jwt2`, `bell` (OAuth)
- **Email**: Nodemailer (SMTP)
- **Validation**: Joi
- **Testing**: Mocha, Chai

---

## Quick Start (Local)

### 1. Requirements
- Node.js (v18+)
- MongoDB (local or cloud instance)

### 2. Installation
```bash
git clone https://github.com/mhstoth/Assignment.git
cd Assignment

# Install Backend
cd src
npm install

# Install Frontend
cd ../client
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database & Auth
DB=mongodb://localhost/discoverRegensburg
COOKIE_PASSWORD=secretpassword12345678901234567890
COOKIE_NAME=discoverRegensburg

# OAuth (Optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary
cloud_name=...
api_key=...
api_secret=...
```

### 4. Execution
**Backend:** `cd src && npm run dev`  
**Frontend:** `cd client && npm run dev`

---

## API Documentation

Interactive Swagger documentation is available at `/documentation` on the running backend service.

---

## Running Tests

The project includes a comprehensive test suite covering backend logic and API endpoints.

```bash
cd src
npm run test
```

---

## Author
**Moritz Hutzler**  
OTH Regensburg  
Full Stack Development - Assignment Level 5
