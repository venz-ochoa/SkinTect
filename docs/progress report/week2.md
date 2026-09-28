## Documentation

## 1. Overview

SkinTect is a tool that enables a user to photograph a skin lesion and get an informal read on whether it looks benign or malignant. It provides a prediction classification alongside a confidence score and a heatmap as a supplement to, not a replacement for, seeing a dermatologist. The project serves as an informal check for users and functions as a portfolio piece showcasing experience in ML, JS, and React.

## 2. Setup and installation

- Initialization: Core React frontend and Python/Google Cloud backend are working. Proceed to Code Access.
- Prerequisites: Install Node.js for the React platform and prepare the required backend environments. Will add more to this as the project develops.
- Code Access: Clone the repository to your device and run the package manager install command to fetch dependencies. Use npm install.
- Environment and Configuration: Set up environment variables for Supabase (database) and Google Cloud (model infrastructure).
- Database: The selected database is Supabase, and will store user accounts, uploaded images, prediction results, confidence scores, and user history.

## 3. How to run it

- Back-end: Make sure Google Cloud Inference VM is running and accessible.
- Front-end: Navigate to client/ and run npm run dev.
- Usage: App will open in the browser. Authentication is not yet integrated, so it bypasses login/signup and defaults straight to the core Image upload-result process.

## 4. Features and usage
Completed:
- Home (Core Prototype): Users can upload or capture a photo of a skin lesion using their device camera or file explorer. The React app packages the image via FormData and sends it to the Google Cloud model. It returns a result panel displaying the prediction label (benign or malignant) and exact confidence percentages.

To do:
- Login / Sign Up: Users can register or log in utilizing email and password fields.
- Home: Heatmap overlay.
- History: A log of the previous scans is available upon request. Displaying a thumbnail, label, confidence score, and date. Users can click into a detailed view to see the full image and heatmap.
- Profile: Users can view the current account information, edit their details (name, profile picture, password, email), or delete their account entirely.

## 5. Project structure
- client/: contains the React frontend application code.
- server/: contains the backend and model integration.
- docs/: holds project documentation files.
- sample photos/: provides sample lesion images for testing the application.
- compose.yml/: configuration for setting up and running the project environment.
- README.md/: main documentation file containing setup, basic information, and instructions.
- AI-Usage.md/: documenting AI tools used during development.

## 6. Screenshots
- Testing of Initial Prototype (SSH, CloudShell, WebApp): located in Screenshots/week-2/

## 7. Known issues and next steps
- Current Progress: Server-side model inference via Google Cloud is successfully set up. The initial React prototype is built and successfully wired to the ML model API. Cross-platform testing (SSH, Cloud Shell, WebApp) confirms the end-to-end pipeline works perfectly for predicting benign vs. malignant classifications.
- Known Risks: Generating the heatmap accurately on top of the uploaded image remains a challenge, as it depends on extracting specific layer data from the model output.
- Next Steps: The immediate focus shifts to Database (Supabase) integration to establish user authentication and scan history, followed by UI/UX CSS polishing.
