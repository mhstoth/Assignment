# discoverRegensburg

This is a Placemark application for discovering locations in Regensburg. It allows users to manage points of interest (Placemarks) with details such as location, categories, and descriptions.

## Features (Level 1)

This project currently implements the **Level 1** requirements:

*   **User Accounts**: Signup, Login, and Session-based Authentication (Cookie).
*   **Placemark Management**:
    *   Create, Read, Update, and Delete Placemarks.
    *   Attributes: Name, Description, Location (Latitude, Longitude), Category.
*   **API**: Basic API endpoints for Users and Placemarks.
*   **Data Persistence**: JSON-based storage (using `lowdb`).
*   **Testing**: Comprehensive Unit Tests for Models and API.

## Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Hapi.js
*   **View Engine**: Handlebars
*   **Database**: JSON Store (LowDB)
*   **Testing**: Mocha, Chai
*   **Validation**: Joi
*   **Styling**: Bulma CSS

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

## Usage

### Running the Application

To start the server locally:

```bash
npm run start
```

The application will be available at `http://localhost:3000`.

### Running Tests

To execute the unit tests:

```bash
npm run test
```

## Project Structure

*   `server/src/api`: API endpoints and logic.
*   `server/src/controllers`: Controllers for handling web routes.
*   `server/src/models`: Data models and JSON store implementation.
*   `server/src/views`: Handlebars templates for the frontend.
*   `server/src/test`: Unit and API tests.
