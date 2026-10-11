# SkinTect

SkinTect is a web app for people who want a quick, informal check on a skin spot: photograph it, get a benign or malignant estimate with a heatmap, and keep a private history to show a doctor.

**Medical disclaimer:** SkinTect is for educational and early screening purposes only. It is not a medical tool. Always see a doctor or dermatologist for a real diagnosis if you are worried about a spot on your skin.

* **Live Site:** [Skintect](https://venz-ochoa.github.io/SkinTect/)
* **API Health Check:** [Healthz](https://skintect.onrender.com/healthz)
* **Demo Video:** [Demo](https://drive.google.com/file/d/1iDrcMLC5uu606zlDQlERwzSv_gAgW-v2/view?usp=sharing)

![A screenshot of the main screen](docs/assets/home%20empty.png)

## What it does

- Upload or take a photo of a skin spot and get a benign or malignant estimate with a confidence score
- See a heatmap of the areas the model focused on
- Tag each scan with where it is on the body and save it to a private history
- View, filter and delete past scans, and see activity and trend charts
- Export a PDF report to bring to a doctor
- Sign up, log in, edit your profile, or delete your account and all of your scans
- Light and dark modes, on phones and computers

## Limitations

The model only knows two answers, benign or malignant. If the photo is not a skin lesion, it still returns its closest match, so those results mean nothing. It does not identify specific conditions, and blurry or dark photos may give unreliable results.

## Built with

React and Vite on the front end, Express and PostgreSQL on the back end, and Python, Flask and PyTorch for the model. The client is on GitHub Pages, the API and database are on Render, and the model runs on a Google Cloud VM.

## Running it yourself

**The whole stack.** Needs Node.js, Docker (or any PostgreSQL), and Python with the model files.

    # 1. the database
    docker run --name my-pg -e POSTGRES_PASSWORD=devpassword \
      -e POSTGRES_DB=skintect -p 5432:5432 -d postgres:17

    # 2. the model server (Python), on a free port
    PORT=5000 python api.py

    # 3. the API
    cd server
    npm install
    cp .env.example .env        # check DATABASE_URL and MODEL_URL
    npm run dev                 # http://localhost:3000, tables are created on first start

    # 4. the client, in another terminal
    cd client
    npm install
    cp .env.example .env        # VITE_API_BASE_URL=http://localhost:3000
    npm run dev                 # http://localhost:5173

**Shortcut.** Once the database container above exists, `start.sh` in the project root starts the database, the API and the client in one go. It does not start the model server, so run step 2 yourself.

Check the API on its own before you blame the client:

    curl http://localhost:3000/healthz     # is the process alive
    curl http://localhost:3000/readyz      # is the database reachable

## Environment variables

None of these are committed. `.env.example` in each folder lists them with placeholder values.

| Name | Where | What it is |
| --- | --- | --- |
| `DATABASE_URL` | server | PostgreSQL connection string. Contains a password |
| `SESSION_SECRET` | server | long random string used to sign login tokens |
| `CORS_ORIGINS` | server | comma-separated origins allowed to call the API, for example `https://venz-ochoa.github.io` |
| `MODEL_URL` | server | address of the Python model server's `/predict` route |
| `NODE_ENV` | server | `production` on your host |
| `PORT` | server | **set by the host**, do not set it yourself |
| `VITE_API_BASE_URL` | client, at build time | your API's public URL, no trailing slash |

Every `VITE_` value is compiled into the built JavaScript and is **public**. Never put a key, a password or a connection string in one.

## Deploying

**Client, to GitHub Pages.** Wired up in `.github/workflows/`. Two one-time steps:

1. **Settings > Pages > Build and deployment > Source: GitHub Actions.**
2. Add `VITE_API_BASE_URL` under **Settings > Secrets and variables > Actions > Variables**, then push to `main` or re-run the workflow.

**API, on Render.** A Web Service pointed at the `server/` folder. Build with `npm install`, start with `npm start`, and set the environment variables in the Render dashboard.

**Database, on Render.** A PostgreSQL database. The API runs `server/db/schema.sql` automatically the first time it starts.

**Model, on Google Cloud.** The Flask server runs on a VM. Set `MODEL_URL` on the API to its address.

## Project structure

    client/          React front end, built by Vite
    server/          Express API and model integration
      db/            pool and schema.sql
    sample photos/   lesion-only test images, no people
    docs/            planning documents, weekly reports and screenshots
    .github/workflows/  deploys the client to GitHub Pages
    compose.yml      configuration for running the project environment
    start.sh         one-run script for local use

## Architecture

The React site only talks to the Express API. The API handles logins, saves data in PostgreSQL, and forwards photos to the Python server, which returns the prediction and heatmap, so the browser never calls the model server directly. Because the client and API are on different sites (`github.io` and `onrender.com`), logins use a token in the request header instead of cookies. Every query that touches a user's data also filters on that user's id, so one account can never read another's scans.

## What I would do next

- Put the model server behind HTTPS and lock it to the API with a shared key and a firewall rule, since photos currently travel over plain HTTP to the VM
- Detect and reject photos that are not skin lesions, instead of always returning a best match
- Move to a custom domain so logins can use secure cookies instead of a token, and add email confirmation and a "forgot password" feature

## Author

venz-ochoa (https://github.com/venz-ochoa). Computer Science - 401.

## AI use

![Built with AI assistance](https://img.shields.io/badge/built%20with-AI%20assistance-0b5fff)

* **Claude:** UI and Polishing (50% of Project)
* **Gemini:** Documentation Assistant (e.g., check if documentation follows set formats, missing info, etc.)

The full account is in [AI-USAGE.md](AI-USAGE.md).

## Licence

MIT, see [LICENSE](LICENSE).
