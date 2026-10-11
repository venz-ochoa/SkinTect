## Documentation

## 1. Overview

SkinTect is a tool that enables a user to photograph a skin lesion and get an informal read on whether it looks benign or malignant. It provides a prediction classification alongside a confidence score and a heatmap as a supplement to, not a replacement for, seeing a dermatologist. The project serves as an informal check for users and functions as a portfolio piece showcasing experience in ML, JS, and React.

## 2. Setup and installation

- Initialization: Core React frontend, Express backend, PostgreSQL database, and Python/Google Cloud model backend are working. Proceed to Code Access.
- Prerequisites: Install Node.js for the React platform and prepare the required backend environments.
- Code Access: Clone the repository to your device and run the package manager install command to fetch dependencies. Use npm install.
- One-Run Setup Script: `start.sh` was used during development and can be used to run the project locally in one step.
- Environment and Configuration: Set up environment variables for the PostgreSQL database (`DATABASE_URL`), the Python model server (`MODEL_URL`), and the client (`VITE_API_BASE_URL`). Supabase is no longer used.
- Database: The selected database is now PostgreSQL hosted on Render, replacing Supabase. It stores user accounts, uploaded images, prediction results, confidence scores, body part tags, activity tracking, and user history. The Express API sets up the required tables automatically the first time it turns on.

## 3. How to run it

- Back-end: Make sure the Google Cloud Inference VM is running and accessible, and that the Render API and database are live (check `/healthz`).
- Front-end: Navigate to client/ and run npm run dev for local use. The deployed version is hosted on GitHub Pages.
- Usage: App will open in the browser. Users sign up or log in, and are redirected to the Home page to start the image upload-result process.

## 4. Features and usage

Completed:
- Home (Core Prototype): Users can upload or capture a photo of a skin lesion using their device camera or file explorer. The React app packages the image via FormData and sends it to the Google Cloud model. It returns a result panel displaying the prediction label (benign or malignant) and exact confidence percentages.
- Heatmap Overlay: The result panel includes a heatmap overlay on the uploaded image showing which areas the model focused on.
- Login / Sign Up: Users can register or log in utilizing email and password fields. User sessions keep users logged in between visits.
- History: A log of previous scans is available, displaying a thumbnail, label, confidence score, and date. Users can click into a detailed view and delete scans they no longer want.
- Body Part Tagging: Users can tag which body part each scan was taken on.
- Activity Tracking: User activity is tracked.
- Export to PDF: Scan results can be exported to a PDF report.
- Profile: Users can view their account information, edit their name, profile picture, and password, or delete their account entirely. Email cannot be edited.
- Dark Mode: Users can switch between light and dark themes.
- UI Polish: The UI is finished and polished, with visual cues such as icons and animations added throughout the app.

To do:
- None for the core feature set. Remaining work is polish (see Next Steps).

## 5. Project structure
- .github/workflows/: GitHub Actions workflow that deploys the client to GitHub Pages.
- client/: contains the React frontend application code.
- server/: contains the backend and model integration.
- docs/: holds project documentation files.
- sample photos/: provides sample lesion images for testing the application.
- compose.yml: configuration for setting up and running the project environment.
- start.sh: one-run setup script for running the project locally.
- SkinTect Demo.mp4: demo video of the app.
- README.md: main documentation file containing setup, basic information, and instructions.
- AI-USAGE.md: documenting AI tools used during development.

## 6. Screenshots
- Testing of Week 3 features (login, history, heatmap, profile, dark mode, PDF export): located in docs/ [week-3 folder]

## 7. Known issues and next steps
- Current Progress: The project moved from local development to deployment. The database and API hosting moved to Render (PostgreSQL), the frontend is deployed with GitHub Pages, and model inference remains hosted on Google Cloud. The decision was made to stop using Supabase. Authentication, user sessions, scan history, profile management, and the heatmap are all working end to end.
- Fixed Issues:
  - Navigation error: after logging in, users were not redirected to the Home page and stayed stuck on the login screen.
  - Heatmap size: the heatmap image was not displaying and threw an error because the file size was too large. Image compression was added to fix this.
  - Schema path: fixed the database schema path error in the Render setup.
  - Heatmap accuracy: the heatmap was not landing on the lesion itself. The model was retrained on both dermoscopic images and phone-camera photos of lesions, so the heatmap now focuses on the lesion more accurately and works better on the kind of photos users actually take.
- Known Risks: The heatmap is a visual aid showing where the model focused, so it should not be treated as a diagnosis. Results are for educational and early screening purposes only.
- Next Steps: The immediate focus is further polishing.
