# AI usage

This project was built with AI assistance. This file is the record of it. It is
graded as the finals badge, and it is worth 100 points.

Start it in week 1 and keep it up as you go. The commit history of this file is
part of the evidence: a file written all at once the night before the deadline
looks exactly like what it is.

## Week 1

## 1. How I used AI

### 2026-09-23 - Project Initialization

- **Tool:** Claude (claude.ai)
- **What I asked for:** To verify if what I designed and chosen (the frameworks, the colors, the typography, the overall design and features) all connect and make sense.
- **What it gave back:** Provided a list of things to revise, such as specifying colors in the prediction results so its easier to read (red and green), originally it was just going to be a single color with the result label being the sole basis of its classification. Also provided specific numbers for the spacing and padding across texts and components.
- **What I kept, what I changed, and why:** I kept everything else the same, while changing what Claude suggested (colors, spacing/padding) as Claude's recommendations provide consistency across the app and easier readability for users.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0

## 2. Where the AI got it wrong

### Case 1 - Initial Color Scheme Mismatch

- **What it gave me:** I asked for suggestions after providing my initial color scheme since maybe it had something better in mind, however it provided colors that were not fit for the vibe of the app. It provided a color scheme of grays, blues, and purples, and typography was rigid and plain. 
- **What was wrong with it:** The initial fonts and spacing didn't fit with what I had in mind. I wanted something cleaner and calmer while looking interactive rather than looking minimalistic.
- **What I did instead:** I provided an image of the color scheme, and asked Claude to just extract the color values so I can use them within the development process. It also provided a list of typography samples, and I chose among them.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0

### Case 2 - Overcomplicating Wireframe Screens

- **What it gave me:** A wireframe structure that split the home page into multiple confusing modal steps just to upload a photo and view results.
- **What was wrong with it:** It made the flow annoying to use. I just wanted a simple screen where you upload, see the preview, hit submit, and get the prediction and heatmap right there.
- **What I did instead:** Ignored its multi-step layout idea and stuck to my original 1-page flow for Home.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0

### Case 3 - Bad Contrast on Result Labels

- **What it gave me:** Really bright neon green and washed-out red colors for the benign and malignant result labels.
- **What was wrong with it:** It failed the contrast check completely against a light background, making it hard to read the results.
- **What I did instead:** Darkened both colors manually and tested them until they passed the contrast check cleanly.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0

## 3. Who wrote what

- **User Written:** Design System A, B, C, D, E, F, Accessibility Check
- **AI-Generated:** Suggestions of typography, conversion from image to hex values, and spacing/padding values.

### Written by me

- **File:** 03-design-system.pdf
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0
- **What it does and why it is built this way:** I wrote the actual design document and sections A through F, deciding the overall vibe, structure, and accessibility checks. Built this way so I had a clear reference for colors, fonts, and screens before jumping straight into code.

### The AI-written part I understand best

- **File:** 03-design-system.pdf
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/4c84c1b6175491975d776a6a62fd5b929483b3b0
- **What it does and why we kept it:** Claude picked out the exact hex codes from my image and gave standard numbers for padding and margins. Kept it because it saved me from manually guessing pixel spacing everywhere across buttons and cards.

## Week 2

## 1. How I used AI

### 2026-09-28 - Basic Frontend Prototype

- **Tool:** Claude (claude.ai)
- **What I asked for:** The simplest front-end for the React page. I already created the code to upload or take a photo of the lesion and the displaying of results. No database integration for now, testing if the connection and setup in Google Cloud works with what I made.
- **What it gave back:** App.jsx with an upload/take a photo button, a preview, an analyze button, and the displaying of results underneath.
- **What I kept, what I changed, and why:** I changed the sample code pasted and used it as a guide for developing today's progress.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

## 2. Where the AI got it wrong

### Case 1 - Unintentional rewriting of unspecified code & wrong preprocessing

- **What it gave me:** Basic front-end prototype for the back-end code I did, plus a generated `requirements.txt` and model preprocessing script for Google Cloud.
- **What was wrong with it:** It rewrote my back-end code without permission, installed the huge CUDA build of PyTorch which ran my Google Cloud VM out of disk space, and guessed `380x380` for preprocessing assuming I didn't use OpenCV and Pillow.
- **What I did instead:** Explicitly asked to leave non-frontend code untouched, re-typed my backend code, excluded the CUDA PyTorch packages in `requirements.txt`, and kept my original OpenCV/Pillow preprocessing sizing.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

### Case 2 - Fake Results

- **What it gave me:** Front-end code prototype now integrating with updated non mockup code but with randomized math for the confidence score
- **What was wrong with it:** I was confused since results didn't match separate model testing. Turns out, the generated code just displayed a randomized number from 0-100.
- **What I did instead:** Explicitly asked to integrate what I did to the front-end, so now it displays based on the returned json of the model.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

### Case 3 - Added an out-of-scope class for results

- **What it gave me:** Front-end with a separate display for the 'unclassified class'
- **What was wrong with it:** The model only has two classes: benign and malignant. It does not handle out-of-scope or non-lesion images. It expects inputs of skin lesions, if not, will return best-match predictions.
- **What I did instead:** Removed all code related for the unclassified classifications.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

## 3. Who wrote what 
- **User Written:** pickFile(), analyze().
- **AI-Generated:** front end for basic prototype (testing purposes).

### Written by me

- **File:** App.jsx (back-end portion)
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9
- **What it does and why it is built this way:** pickFile() is a function that lets users upload or take a photo (mobile), and updates the states (file). analyze() is the one doing all the work, appends the image to a new object so it can be sent to the server, waits and parses result into a json, then updates the states (result).

### The AI-written part I understand best

- **File:** App.jsx (front-end portion)
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9
- **What it does and why we kept it:** Just displays a very basic, skeleton-like, interface solely for uploading an image and generating a response. Due to it being extremely basic, it was easily understandable. Will keep for now for more testing and integration with the database and user logins.

## Week 3

## 1. How I used AI

### 2026-10-01 - Moving from Supabase to Express & PostgreSQL + Initial UI Polish

- **Tool:** Claude (claude.ai)
- **What I asked for:** To style and polish the frontend UI (adding icons and animations) below my `//claude generated UI` marker comment while I moved the backend off Supabase to my own Express and PostgreSQL setup (`server.js` and `schema.sql`).
- **What it gave back:** Updated frontend JSX layouts, custom SVG icons, and CSS entrance animations for the pages that connected to the new Express routes I wrote.
- **What I kept, what I changed, and why:** I wrote the entire backend (`server.js` and `schema.sql`) myself, including the auth flow, image storage, and API routes, and kept all my frontend logic above the marker comment untouched. I kept Claude's UI styling, icons, and animations below the marker after tweaking them to match my design system.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/5007f57fe066d0a60dffbb1bda40b2299b8b00d5

### 2026-10-03 - Frontend UI Redesign, Custom Icons & Page Layouts (Entry 1)

- **Tool:** Claude (claude.ai)
- **What I asked for:** To style the frontend UI below my `//claude generated UI` marker comment across `Home.jsx`, `History.jsx`, `Profile.jsx`, and `NavBar.jsx`, using my Tailwind theme tokens and generating a matching set of sage SVG icons.
- **What it gave back:** Redesigned JSX markup below my marker comment—adding a drag-and-drop upload zone, a split bar for benign vs. malignant probabilities, a photo gallery grid with a detail modal for History, a two-column Profile layout, and custom SVG icons.
- **What I kept, what I changed, and why:** I kept full creative authority over the layout and kept all my state, fetch, and backend logic above the marker untouched. When the first version of `signup.jsx` came back way too busy with a brand panel and strength meter, I rejected it and told Claude to make it a single clean centered card instead.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6eeeed53c8a14540717fffa78bff6917e2316690

### 2026-10-03 - Dark Mode, Body Part Tagging, Trends Chart, PDF Export & Animations (Entry 2)

- **Tool:** Claude (claude.ai)
- **What I asked for:** Frontend components for the features I wanted to add to finish the app: an interactive body map for tagging lesions, a weekly trends chart, downloadable PDF scan reports, medical disclaimers, dark mode, and CSS entrance animations.
- **What it gave back:** `BodyMap.jsx`, `TrendsChart.jsx`, `Disclaimer.jsx`, `ConsentModal.jsx`, `ThemeToggle.jsx`, `SplitBar.jsx`, `report.js` (using `jspdf`), and CSS keyframe animations for each page.
- **What I kept, what I changed, and why:** I kept the components and animations, wired them up to the new backend endpoints I wrote (`/api/scans/recent`, `/api/scans/trends`, `PATCH /api/scans/:id`), and removed the Google Maps "Find a dermatologist" link that Claude tried to add to the disclaimer because I didn't want external map links cluttering the result view.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6eeeed53c8a14540717fffa78bff6917e2316690

### 2026-10-04 - Render Deployment, CORS & Cross-Domain Session & General Troubleshooting

- **Tool:** Claude (claude.ai)
- **What I asked for:** Help troubleshooting why login stayed stuck on the login screen after deploying the frontend to GitHub Pages and my Express/PostgreSQL backend to Render, along with fixing CORS errors and `schema.sql` file path issues.
- **What it gave back:** Pointed out that hosting the frontend and backend on different domains blocks default cookies unless cross-domain headers/tokens and CORS origins are explicitly configured, and showed how to resolve `schema.sql` relative paths on Render.
- **What I kept, what I changed, and why:** I kept my backend auth logic and updated my header handling, CORS origin configuration, and `schema.sql` path resolution in my Express server so login and navigation worked smoothly in production.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6cd8a5d131f1028430c21ffddc7d0d69e8e640e1, https://github.com/venz-ochoa/SkinTect/commit/48087e910b39ce01373a797aebae69e1e48dcceb, https://github.com/venz-ochoa/SkinTect/commit/ebf6654b68f5dbcdd10454648bec4fad299c06dc, and https://github.com/venz-ochoa/SkinTect/commit/8f07ce3c9d7cb1af8abb01401766cde9d4c82f52

### 2026-10-11 - Final Polish, Setup Script & Documentation

- **Tool:** Gemini
- **What I asked for:** Help checking my final deployment checklist, formatting the mockups documentation, and cleaning up rate-limiting and database reset commands.
- **What it gave back:** Markdown formatting for the desktop and mobile screenshots, rate-limiting tweaks, and a one-line script to wipe test data from Render's Ohio PostgreSQL instance.
- **What I kept, what I changed, and why:** Kept the Markdown image links with `%20` spacing so I didn't have to rename my screenshot files, and used the terminal command to clear out my test accounts before recording the final demo.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/efb92915f181fd280a50c41b4f64e7fbf48a90ce, https://github.com/venz-ochoa/SkinTect/commit/7f8fa0ab48f6337b04f51484a6e8ce53f08766bf

## 2. Where the AI got it wrong

### Case 1 - Editing My Code Above the Marker & Deleting Comments

- **What it gave me:** In `Home.jsx` and `FormField.jsx`, Claude added 10 icon imports above my `//claude generated UI` marker comment, rewrote my existing lowercase comments, and replaced my original input classes in `FormField.jsx` instead of just adding to them.
- **What was wrong with it:** I gave strict ground rules to never touch my logic above the marker comment and to never delete or rewrite my comments, since I wrote the state and backend wiring myself and didn't want it broken again.
- **What I did instead:** Forced it to revert the changes above the marker, put every single one of my original comments back word-for-word, and load the SVG icons below the marker using `new URL(..., import.meta.url).href`.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6eeeed53c8a14540717fffa78bff6917e2316690
  
### Case 2 - Broken Vite Icon Paths & File Casing Mismatches

- **What it gave me:** Imported the SVG icons from the wrong folder path in `Profile.jsx`, and imported `../components/FormField` with a capital `F` in `Login.jsx` and `Signup.jsx` even though my actual file was named `Formfield.jsx`.
- **What was wrong with it:** Because the AI didn't run the code in a browser, Vite immediately threw import resolution errors when I ran it locally, and case-sensitive Linux builds on GitHub Actions/Render fail when import casing doesn't match the real filename.
- **What I did instead:** Fixed the icon paths to point to `src/images/svg/` and matched the component import casing across the files so Vite bundled everything cleanly.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6eeeed53c8a14540717fffa78bff6917e2316690

### Case 3 - Wrong Confidence Math on Benign Scans & Logged-Out State Bug

- **What it gave me:** In `History.jsx`, the scan cards displayed `malignant_probability` directly as the "confidence" score even when the lesion was classified as benign. Also, in `NavBar.jsx`, it checked if `user` was truthy without checking for `user.error`, and forgot to call `useLocation()`.
- **What was wrong with it:** A benign scan with a 5% malignant probability showed "5% confidence" instead of 95% confidence in being benign. And because `/api/me` returns an error object when logged out, the navbar thought logged-out visitors were logged in and didn't update links after logging in without a page refresh.
- **What I did instead:** Fixed the math to invert the probability for benign results (`1 - malignant_probability`), updated the auth check to `!user || user.error`, and called `useLocation()` so the navbar updates right away after logging in.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/48087e910b39ce01373a797aebae69e1e48dcceb, https://github.com/venz-ochoa/SkinTect/commit/02ba6ddf5329b222cf98efc1ac7ffe975a095156

## 3. Who wrote what

- **User Written:** The entire backend (`server.js`, `schema.sql`, database queries, auth, image compression, model retraining, and all API routes) + all frontend state/fetch logic above `//claude generated UI` + creative direction and design system.
- **AI-Generated:** Frontend JSX layout and styling below the `//claude generated UI` marker, SVG icons, and CSS animations (under my direction).

### Written by me

- **File:** `server/server.js`, `server/schema.sql`, model training pipeline, and the logic portion of `Home.jsx`, `Login.jsx`, `Signup.jsx`, `History.jsx`, and `Profile.jsx`
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/5007f57fe066d0a60dffbb1bda40b2299b8b00d5
- **What it does and why it is built this way:** I wrote the entire Express and PostgreSQL backend from scratch after moving away from Supabase, plus retrained the model on both dermoscopic and phone-camera photos so the Grad-CAM heatmap actually lands on the lesion instead of the edges. On the frontend, I wrote all the functions, hooks, and API calls at the top of every page and put a `//claude generated UI` comment marker underneath so I controlled how data worked while letting Claude handle the JSX styling below the line.

### The AI-written part I understand best

- **File:** `src/pages/Home.jsx`, `src/pages/History.jsx`, `src/pages/Profile.jsx` (the JSX UI below `//claude generated UI`) & `src/components/SplitBar.jsx`
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/6eeeed53c8a14540717fffa78bff6917e2316690
- **What it does and why we kept it:** Renders the visual interface using my Tailwind theme tokens (`bg-bg`, `bg-surface`, `text-primary`, `text-benign`, `text-malignant`)—including the drag-and-drop upload card, the `SplitBar` component that visualizes the benign vs. malignant split, the photo/heatmap toggle switch, and the CSS entrance animations. I kept it because it followed my design system and creative direction while plugging straight into the state variables and backend routes I wrote above the marker.
