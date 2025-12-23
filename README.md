# discoverRegensburg

This is a Placemark application for discovering locations in Regensburg. It allows users to manage points of interest (Placemarks) with details such as location, categories, and descriptions.

## Features (Level 2 Enhanced)

This project currently implements the **Level 2** requirements:

*   **User Accounts**: Signup, Login, and Session-based Authentication.
*   **JWT Authentication**: Secure API access using JSON Web Tokens.
*   **Placemark Management**:
    *   Create, Read, Update, and Delete Placemarks.
    *   Attributes: Name, Description, Location (Latitude, Longitude), Category.
    *   **Image Upload**: Upload images to Cloudinary via API or Web Interface.
*   **API**: 
    *   Fully documented REST API using **Swagger**.
    *   Secured endpoints.
*   **Data Persistence**: **MongoDB** database using Mongoose ODM.
*   **Testing**: Comprehensive Unit Tests for Models, API, and Authentication flow.

## Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Hapi.js
*   **Authentication**: `hapi-auth-cookie` (Web), `hapi-auth-jwt2` (API)
*   **Database**: MongoDB (Mongoose)
*   **Documentation**: Hapi Swagger
*   **Testing**: Mocha, Chai
*   **Validation**: Joi
*   **Styling**: Bulma CSS
*   **Image Hosting**: Cloudinary

## Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the server directory:
    ```bash
    cd server
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the `server` directory with the following variables:
    ```env
    # Web session cookie (Hapi cookie auth)
    COOKIE_NAME=discoverRegensburg
    COOKIE_PASSWORD=change-me-to-a-long-random-secret

    # MongoDB
    DB=mongodb://localhost/playtime

    # Cloudinary (used by image upload)
    cloud_name=your_cloud_name
    api_key=your_api_key
    api_secret=your_api_secret
    ```

## Usage

### Running the Application

To start the server locally:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### API Documentation

The interactive API documentation is available at:
`http://localhost:3000/documentation`
`https://discover-regensburg-2.onrender.com/`

### API Authentication

1.  Get a token:
    - `POST /api/users/authenticate` with JSON `{ "email": "...", "password": "..." }`
2.  Call secured endpoints with header:
    - `Authorization: Bearer <token>`

### Running Tests

To execute the unit tests:

```bash
npm run test
```

## Admin User

The application seeds demo data on startup (and drops collections):

*   **Email**: `moritz@diehutzlers.de`
*   **Password**: `1`
*   **Role**: Admin (`isAdmin: true`)


## Deployment 

* `https://discover-regensburg-2.onrender.com/`



## Project Structure

*   `server/src/api`: API endpoints, JWT logic, and Swagger validation.
*   `server/src/controllers`: Controllers for handling web routes.
*   `server/src/models`: Mongoose schemas and database connection.
*   `server/src/views`: Handlebars templates for the frontend.
*   `server/src/test`: Unit and API tests.
