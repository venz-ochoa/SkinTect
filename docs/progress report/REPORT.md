## Weekly Increment Report
Week of: September 23, 2026

## What changed this week
- Finalized the project proposal for "Skin Tect," an application for informally identifying skin lesions.
- Designed the application wireframes, including a screen map, box-sketches, and a component.
- Created a design layout utilizing Tailwind and shadcn/ui, which details color tokens, type scale, spacing rules, and reusable components.
- Initialized the project repository by copying the template.
- Researched and selected Google Cloud and Supabase for the backend and database architecture.

## Why
- These changes were necessary to establish the foundational documentation, UI/UX design rules, and repository structure before initiating active backend and frontend coding.

## What broke or what I got stuck on
- I am currently researching an anticipated problem: wiring the React frontend to the machine learning model inference. I'm trying to see how to ensure that the generated heatmap aligns accurately on top of the user's uploaded image, which heavily depends on the specific format of the model's output.

## What is left
- Coding the backend infrastructure (starting this week) using Google Cloud and Supabase.
- Building the React frontend platform and applying the design system.
- Integrating the pre-trained Machine Learning model with the React and database layers.
- Developing the core application features, including image upload functionality, user authentication, and the scan history log.

---

## Weekly Increment Report
Week of: September 28, 2026

## What changed this week
- Finished setting up server-side (model) inference via Google Cloud
- Developed initial prototype (no database integration yet. Purely model)
- Conducted testings to ensure model and system integration worked properly (SSH, Cloud Shell, WebApp)

## Why
- Establishing the Google Cloud was needed since it provided the compute power required for the ML model to analyze the uploaded images in real time
- Building the prototype without a database allows me to focus strictly on the code end-to-end pipeline (React front-end can send images and parse the model json results).
- Cross-platform testing was critical to identify and resolve any API communication problems, like the 400 Bad Request which was due to an invalid image upload.

## What is left
- Database integration
- User authentication
- UI/UX Polish

---

## Weekly Increment Report
Week of: October 4, 2026

## What changed this week
- Moved from Supabase to an Express and PostgreSQL backend, and deployed the database and API on Render and the frontend on GitHub Pages.
- Added sign up and login with user sessions, plus a profile page where users can edit their name, profile picture, and password, or delete their account.
- Added scan history (save, view, and delete scans), heatmap overlay with a toggle, body part tagging, activity tracking, PDF export, and dark mode.
- Added file compression for uploads and heatmaps, and polished the UI with animations and icons.
- Retrained the model on both dermoscopic and phone-camera images so the heatmap lands on the lesion.
- Added a one-run setup script, filled out the README, and recorded a demo video.

## Why
- Supabase was replaced to keep the database, authentication, and API in one backend that I control, which made deployment and debugging easier.
- History, tagging, activity tracking, and PDF export turn the single-scan prototype into a tool for tracking lesions over time.
- Retraining the model was needed because the heatmap kept highlighting the edges of the photo instead of the lesion.

## What broke or what I got stuck on
- Login errors and navigation bugs: users stayed stuck on the login page after signing in. Fixed with several rounds of login and navigation fixes.
- The heatmap was not showing because the file was too large. Fixed with image compression.
- Render deployment issues with CORS and the database schema path, both fixed.
- The model always gives a best match, even when the input is not a skin lesion. Documented as out of scope for now.

## What is left
- Further polishing of the UI.
- Final testing across devices and browsers.
- Possibly detecting and rejecting non-lesion images.
