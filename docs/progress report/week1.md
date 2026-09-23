## Documentation Week 1

## 1. Overview

SkinTect is a tool that enables a user to photograph a skin lesion and get an informal read on whether it looks benign or malignant. It provides a prediction classification alongside a confidence score and a heatmap as a supplement to, not a replacement for, seeing a dermatologist. The project serves as an informal check for users and functions as a portfolio piece showcasing experience in ML, JS, and React.

## 2. Setup and installation

- Initialization: The project base has been established by copying the template repository and uploading the necessary documentation files.
- Prerequisites: Install Node.js for the React platform and prepare the required backend environments. Will add more to this as the project develops.
- Code Access: Clone the repository to your device and run the package manager install command to fetch dependencies. However, once the project is completed, a simpler way to run will be available.
- Environment and Configuration: Set up environment variables for Supabase (database) and Google Cloud (model infrastructure).
- Database: The selected database is Supabase, and will store user accounts, uploaded images, prediction results, confidence scores, and user history.

## 3. How to run it

Will add once a initial prototype of the project has been developed. However, the basic instruction follows. Launch the web application using the standard React start command (e.g., npm run dev). Upon doing the command, the app will open in the browser and display either Login/Sign Up if the user is not authenticated, or default to the home screen if the user is authenticated.

## 4. Features and usage
- Login / Sign Up: Users can register or log in utilizing email and password fields.
- Home: Users can upload or capture a photo of a skin lesion via a designated button. The model processes the image and returns a result panel containing a prediction label (benign or malignant), a confidence score, and a heatmap overlay.
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

Will add once project coding begins. Screenshots will include backend testing, database testing, and interface once developed.

## 7. Known issues and next steps
- Current Progress: The template repository is copied and edited, and backend development is beginning this week using Google Cloud and Supabase.
- Known Risks: A significant challenge is wiring the React frontend to the ML model inference. Getting the heatmap generated accurately on top of the uploaded image is an established risk, as it depends on how the model outputs the data. Though during previous testing, it worked just fine.
- Next Steps: The immediate focus on coding the backend infrastructure and integrating the ML model with React and database layers.
