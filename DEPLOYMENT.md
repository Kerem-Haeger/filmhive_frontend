# DEPLOYMENT.md — FilmHive Frontend

This document describes how the **FilmHive frontend** application is deployed to **Heroku**.

The frontend is a **React (Create React App)** application with a lightweight **Express** server that serves the production build.

Deployment is performed using the **Heroku Web Interface** connected to **GitHub**.

---
## Important: ESLint Usage & Preflight Checks

This project uses **ESLint** for code quality enforcement during development and before deployment.

### ESLint in This Project

- ESLint is installed as a dependency and configured using:
  - `eslint`
  - `eslint-config-react-app`
- Linting is available via the scripts:
  - `npm run lint`
  - `npm run lint:fix`
- These checks are used during development to:
  - Enforce consistent code style
  - Catch common JavaScript and React issues early
  - Improve readability and maintainability

### Skipping CRA Preflight Checks in Production

Create React App includes a **preflight check** that runs before starting or building the application.  
This check can fail when:
- Dependencies are intentionally pinned to specific versions
- ESLint is installed explicitly rather than relying on CRA’s internal version
- The project uses a custom Express production server

In FilmHive, **preflight checks are intentionally bypassed** because:

- The project uses a **controlled and pinned dependency set**
- ESLint is already enforced via explicit scripts and configuration
- The application is tested manually and in production-like conditions before deployment
- The production build (`npm run build`) completes successfully without runtime errors

Skipping the preflight check prevents false-positive build failures while **not reducing code quality**, as linting is still available and actively used during development.

### Justification

This approach was chosen to:
- Maintain compatibility with the required Node (16.20.2) and npm (8.19.4) versions
- Avoid unnecessary deployment failures caused by CRA tooling assumptions
- Keep the production build process stable and predictable
- Retain full control over linting rather than relying on implicit framework behaviour

This is a **conscious and documented decision**, aligned with real-world deployment practices where tooling is adapted to the project’s constraints rather than default assumptions.

---

## Deployment Overview

- Platform: **Heroku**
- Deployment method: **GitHub integration (Web UI)**
- Frontend framework: **React (Create React App)**
- Production server: **Express**
- Repository: `filmhive_frontend`

---

## Version & Environment Constraints

The following versions are required and enforced via `package.json`:

- **Node.js:** 16.20.2  
- **npm:** 8.19.4  

These versions are required to ensure compatibility with:
- Create React App
- react-scripts
- Heroku Node buildpack

Using newer Node versions (17+) may cause OpenSSL / crypto-related build failures.

---

## Environment Variables (Heroku Config Vars)

The frontend requires the following environment variables to be set in Heroku:

### Required

- `REACT_APP_API_URL`  
  Base URL of the deployed backend API  
  Example:
https://filmhive-api.herokuapp.com

### Recommended

- `NODE_ENV=production`

Notes:
- Only environment variables prefixed with `REACT_APP_` are exposed to the React application.
- No secret keys or credentials are stored in the repository.

---

## Express Production Server

The application uses a small Express server (`server.js`) to serve the compiled React build.

Key responsibilities:
- Serve static files from the `build/` directory
- Handle client-side routing with a wildcard fallback

This ensures React Router routes (e.g. `/films/123`) work correctly on page refresh in production.

---

## Heroku Deployment Steps (Web Interface)

### 1. Create a Heroku Application

1. Log into the Heroku dashboard
2. Click **New → Create new app**
3. Choose a unique app name
4. Select a region (EU or US)
5. Click **Create app**

---

### 2. Configure Buildpack

1. Go to **Settings → Buildpacks**
2. Add the **nodejs** buildpack
3. Ensure it is the only buildpack

---

### 3. Set Config Vars

1. In **Settings → Config Vars**
2. Add:
 - `REACT_APP_API_URL`
 - `NODE_ENV=production`

---

### 4. Connect GitHub Repository

1. Go to **Deploy**
2. Select **GitHub** as the deployment method
3. Authenticate with GitHub if required
4. Search for and connect the `filmhive_frontend` repository
5. Select the `main` branch

---

### 5. Deploy the Application

Deployment can be done in one of two ways:

- **Automatic Deploys**  
Enabled so that each push to `main` triggers a new deployment

OR

- **Manual Deploy**  
Click **Deploy Branch** to trigger a deployment manually

---

## Build & Runtime Process

During deployment, Heroku performs the following steps:

1. Installs dependencies using `npm install`
2. Runs the `heroku-postbuild` script:
 - `npm run build`  
 - Generates an optimized production build in `/build`
3. Starts the application using:
 - `npm start`
 - This runs `node server.js`

---

## Local Production Test (Optional)

Before deploying, the production setup can be tested locally:

1. Install dependencies:
npm install

markdown
Copy code

2. Build the app:
npm run build

markdown
Copy code

3. Run the production server:
npm start

arduino
Copy code

The application will be available at:
http://localhost:3000

yaml
Copy code

---

## Development vs Production

### Development
- Command: `npm run start:dev`
- Uses CRA development server
- API requests proxied to `http://localhost:8000`

### Production
- Express serves the compiled React build
- API requests use `REACT_APP_API_URL`
- Client-side routing handled by Express fallback

---

## Common Deployment Checks

- Ensure `REACT_APP_API_URL` is set correctly
- Ensure backend API allows CORS from the frontend domain
- Ensure `package-lock.json` is committed
- Ensure Node and npm versions match `package.json`
- Ensure `server.js` is present and committed

---

## Deployment Outcome

The deployed application:
- Serves a production-optimized React build
- Supports client-side routing
- Communicates securely with the backend API
- Matches the local production build behavior