# SkinTect

A web app for checking skin lesions. Upload a photo, get a benign or malignant result with a confidence score and heatmap, and save your scans to track changes over time.

**Live site:** https://venz-ochoa.github.io/SkinTect/
**API:** https://YOUR-API.onrender.com/healthz
**Demo video:** [to add]

> SkinTect is a screening aid, not a medical diagnosis. See a doctor about any spot you are worried about.

![Screenshot](docs/assets/screenshot.png) [to add]

## Features

- Sign up and log in
- Upload a lesion photo and get a result with a heatmap
- Save scans with a body location and browse them in your history
- Profile stats, trends chart, and a PDF report to bring to a doctor
- Edit your profile, switch light/dark theme, delete your account

## Built with

React + Vite (GitHub Pages), Express (Render), PostgreSQL (Render), and a separate model server for predictions.

## How it fits together

The browser talks only to the Express API. The API saves data in PostgreSQL and forwards photos to the model server. Login uses a token sent in the `Authorization` header, because browsers block cookies between `github.io` and `onrender.com`.

## Run it locally

You need Node.js 20+ and a PostgreSQL database.

    # API
    cd server
    npm install
    cp .env.example .env     # fill in the values below
    npm run dev              # http://localhost:3000

    # Client (new terminal)
    cd client
    npm install
    cp .env.example .env     # set VITE_API_BASE_URL=http://localhost:3000
    npm run dev              # http://localhost:5173

## Environment variables

| Name | Where | What it is |
| --- | --- | --- |
| `DATABASE_URL` | server | PostgreSQL connection string |
| `SESSION_SECRET` | server | Long random string for signing login tokens |
| `CORS_ORIGINS` | server | Site allowed to call the API, e.g. `https://venz-ochoa.github.io` |
| `MODEL_URL` | server | Address of the prediction server |
| `NODE_ENV` | server | `production` on Render |
| `VITE_API_BASE_URL` | client | Public URL of the API, no trailing slash |

Never commit real values. `VITE_` values are public.

## Deploying

- **Client:** GitHub Pages through the GitHub Actions workflow. Add `VITE_API_BASE_URL` under Settings > Secrets and variables > Actions, then push to `main`.
- **API:** Render web service from the `server/` folder. Build: `npm install`. Start: `npm start`. Add the server variables in the dashboard.
- **Database:** Render PostgreSQL. The API creates its tables on first start.

## What I would do next

- Use a custom domain so login can use secure cookies instead of a stored token
- Put the model server behind https and add rate limiting
- Add email verification and password reset

## Author

Venice Ochoa ([github.com/venz-ochoa](https://github.com/venz-ochoa)). Course and section: Computer Science - 401.

## Licence

MIT, see [LICENSE](LICENSE).