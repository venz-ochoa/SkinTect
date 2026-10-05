# SkinTect: An ML-Assisted Skin Lesion Analysis Platform
SkinTect is a web app that helps users catch and track skin lesions early. It uses AI to analyze uploaded photos of skin spots and estimates whether they are benign or malignant. It also provides a visual heatmap to show exactly which parts of the image the AI focused on.

The platform includes a private dashboard where users can save their scans, record where the spot is on their body, view charts of their history, and create PDF reports to show their doctor.

**Medical Disclaimer:** SkinTect is for educational and early screening purposes only. It is not a medical tool. Always see a doctor or dermatologist for a real diagnosis if you are worried about a spot on your skin.

* **Live Site:** [Skintect](https://venz-ochoa.github.io/SkinTect/)
* **API Health Check:** [Healthz](https://skintect.onrender.com/healthz)
* **Demo Video:** [Demo](SkinTect Demo.mp4)

## Features
* **Predictive Analysis:** Uses an AI model (EfficientNet-B4) to check if an image is benign or malignant and highlights the important areas with a heatmap.
* **Longitudinal Tracking:** Lets users save their past scans, record the body location, and watch for visual changes over time.
* **Clinical Reporting:** Creates PDF reports and charts from the user's data so they can easily share them with a doctor.
* **Secure Authentication:** Keeps accounts and patient data safe with secure logins.
* **Responsive Interface:** Works smoothly on both phones and computers, and includes light and dark modes.

## Built With
The app is broken into a few separate pieces that talk to each other:
* **Frontend Client:** React and Vite
* **Backend API:** Node.js and Express
* **Relational Database:** PostgreSQL
* **Inference Engine:** Python, Flask, PyTorch, and Google Cloud (VM)

## How it fits together
The React website only talks to the Express API. The Node.js backend handles logins, saves data in PostgreSQL, and sends the photos to the Python server for AI analysis. Because the frontend and backend are hosted on different websites (`github.io` and `onrender.com`), the app uses a special token in the headers to keep users logged in, rather than standard web cookies.
Application Programming Interface (API) Setup

```bash
cd server
npm install
cp .env.example .env     # Fill in the variables using the table below
npm run dev              # Starts the server at http://localhost:3000

# Client (new terminal)
cd client
npm install
cp .env.example .env     # Set VITE_API_BASE_URL=http://localhost:3000
npm run dev              # Starts the website at http://localhost:5173

```
*(Note: The Python AI server also needs to be running on your computer if you want to test the image predictions locally.)*

## Environment Variables
| Variable | Component | Description |
| --- | --- | --- |
| `DATABASE_URL` | Server | The link to connect to your PostgreSQL database |
| `SESSION_SECRET` | Server | A long, random password used to secure user logins |
| `CORS_ORIGINS` | Server | The websites allowed to talk to the API (e.g., `[https://venz-ochoa.github.io](https://venz-ochoa.github.io)`) |
| `MODEL_URL` | Server | The web address of your Python AI server |
| `NODE_ENV` | Server | Set this to `production` when deploying it live |
| `VITE_API_BASE_URL` | Client | The public web address of your Express API |

## Deploying
* **Client (GitHub Pages):** Updates automatically using GitHub Actions. Add `VITE_API_BASE_URL` in your GitHub settings (Settings > Secrets and variables > Actions) before pushing your code to the `main` branch.
* **Node API (Render):** Hosted as a Web Service running the `server/` folder. It builds using `npm install` and runs with `npm start`. You can add your environment variables right in the Render dashboard.
* **Database (Render):** A PostgreSQL database. The Express API automatically sets up the required tables the first time it turns on.

## What I would do next
* **Domain Integration:** Move to a custom web address so the app can use standard, secure cookies for logins.
* **Security Enhancements:** Add HTTPS to the Python server and limit how often people can request predictions (rate limiting) to prevent spam.
* **User Verification:** Add email confirmation and a "forgot password" feature.
* **Model Optimization:** Improve the ML's heatmap so it highlights the skin spot more accurately without lighting up the edges of the photo.

## Author
* Venice Ochoa (https://github.com/venz-ochoa)
* Course and Section: Computer Science - 401

## License
This project is licensed under the MIT License, see [LICENSE](LICENSE).

# My final project
* **Repository:** https://github.com/venz-ochoa/SkinTect
* **Live site:** https://venz-ochoa.github.io/SkinTect/
* **API:** https://skintect.onrender.com/healthz