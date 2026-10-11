# 1. App Proposal (Revised)

## App name
**SkinTect**

## What the app is for, in one sentence
A web application that lets a user upload or capture a photo of a skin lesion and receive an informal AI-assisted read on whether it appears benign or malignant, complete with a confidence score, Grad-CAM visual heatmap, body-location tracking, and downloadable PDF report as a supplement to—not a replacement for—seeing a dermatologist.

## Who is it for
* **Primary:** For me and anyone reviewing my project portfolio, showcasing full-stack engineering across React, Express, PostgreSQL, cloud deployment, and deep learning inference.
* **Secondary:** Anyone who wants to do a quick, informal skin check and track lesion history by body area before deciding whether to book a clinical visit with a dermatologist.

## Sections or routes this app needs

| # | Section / Route | What is it for |
| :--- | :--- | :--- |
| 1 | **Start (Splash)** | Landing screen introducing SkinTect and routing users to login or sign up |
| 2 | **Login / Sign Up** | User authentication and account registration with validation |
| 3 | **Medical Disclaimer** | Dedicated acknowledgment screen reminding users the tool is not a medical diagnosis |
| 4 | **Home** | Upload/capture lesion photo, tag body location, view prediction + Grad-CAM heatmap + confidence score, and export a PDF report |
| 5 | **History** | View, filter (by body area or result), re-tag, or delete past scans, and open detailed scan views with heatmaps |
| 6 | **Profile** | View scan statistics and weekly trend charts, toggle light/dark mode, update profile photo/name/password, or delete account |

## State: what data does the app hold?

| Data | Shape (rough) | Who owns it (which component) | Changes when... |
| :--- | :--- | :--- | :--- |
| `uploadedImage` | `File` / preview URL string | `Home` | User selects, drags, or captures a new lesion photo |
| `bodyLocation` | `string \| null` (e.g., `"left_forearm"`) | `Home` / `History` | User selects or updates the anatomical area for a scan |
| `prediction` | `{ prediction: "benign" \| "malignant", malignant_probability: number }` | `Home` | Model server returns an inference result after upload |
| `heatmap` | Base64 / data URL string | `Home` | Model generates the Grad-CAM heatmap overlay |
| `scanStatus` | `"idle" \| "loading" \| "finished" \| "error"` | `Home` | Upload starts, inference completes, or an error is returned |
| `scanHistory` | `[{ id, photo, heatmap, prediction, malignant_probability, body_location, created_at }]` | `History` | User opens History, filters by location, saves a new scan, updates a tag, or deletes a scan |
| `scanStatsAndTrends` | `{ today, benign, malignant, last_scan, weeks: [...], locations: [...] }` | `Profile` | User visits Profile after adding or deleting scans |
| `currentUser` | `{ id, name, email, profile, theme }` | `App` | User logs in/out, uploads a profile picture, edits account details, or toggles light/dark theme |

## What each screen contains

### Start & Disclaimer
* **Block 1:** Branding, logo, and call-to-action buttons to Log In or Sign Up
* **Block 2:** Dedicated medical disclaimer modal/screen requiring user acknowledgment before scanning

### Login / Sign Up
* **Block 1:** Name (on sign up), email, and password input fields with validation rules
* **Block 2:** Submit button with rate-limit and error handling
* **Block 3:** Inline error and validation feedback messages
* **Block 4:** Toggle switch between Login and Sign Up modes

### Home
* **Block 1:** Upload/Take photo input (drag-and-drop, file picker, or mobile camera capture) and optional body-location selector
* **Block 2:** Preview of the uploaded image (plus an Empty State before an image is chosen)
* **Block 3:** Analyze / Submit button and loading state while the model runs
* **Block 4:** Results panel showing benign/malignant classification, confidence percentage, and interactive Grad-CAM heatmap toggle
* **Block 5:** Actions to save scan to history or download a formatted PDF summary report

### History
* **Block 1:** Grid/list of past scans showing thumbnail, prediction badge, confidence score, body location tag, and timestamp
* **Block 2:** Detailed scan modal/view with full-size original photo, interactive heatmap toggle, body-location editor, PDF export, and delete button
* **Block 3:** Empty State when the user has no recorded scans yet
* **Block 4:** Filter controls by body location (including untagged) and classification outcome

### Profile
* **Block 1:** Current user header displaying profile picture, name, email, and Light/Dark theme toggle
* **Block 2:** Scan analytics dashboard (total benign/malignant counts, scans today, weekly trend chart, and body-area breakdown)
* **Block 3:** Edit Profile form for updating profile picture, name, and password with confirmation feedback
* **Block 4:** Delete Account section requiring password confirmation before permanently wiping user data and scans

## Content you need to gather
* Trained skin lesion classification model + Grad-CAM generator hosted on a Google Cloud VM
* Custom SkinTect logo and UI icons
* Sample benign and malignant lesion images for testing and demo use
* Medical disclaimer text block and explicit warnings ("NOT A MEDICAL DIAGNOSIS")
* PostgreSQL database schema (`users` and `scans` tables) and split-host environment configurations (GitHub Pages + Render + Google Cloud)

## One risk
Wiring the HTTPS React frontend and Render API to the model inference server on Google Cloud, and accurately generating and rendering the Grad-CAM heatmap overlay on top of the uploaded lesion photo without blocking requests or exposing unencrypted calls to the browser.
