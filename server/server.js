import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { pool } from "./db/pool.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import fs from "node:fs";

const app = express();

// CORS before the routes. Middleware registered after a route never sees that
// route's requests, which is the m4 lesson showing up in production.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PgStore = connectPgSimple(session);
const isProd = process.env.NODE_ENV === "production";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//the body areas a scan can be tagged with, keep this list in sync with src/lib/bodyLocations.js
const BODY_LOCATIONS = [
  "head",
  "neck",
  "chest",
  "abdomen",
  "pelvis",
  "upper_back",
  "lower_back",
  "buttocks",
  "left_upper_arm",
  "right_upper_arm",
  "left_forearm",
  "right_forearm",
  "left_hand",
  "right_hand",
  "left_thigh",
  "right_thigh",
  "left_lower_leg",
  "right_lower_leg",
  "left_foot",
  "right_foot",
  "other",
];

//returns the location if it is valid, null if it was left empty, or undefined if it is not a real body area
function cleanLocation(value) {
  if (value === undefined || value === null || value === "") return null;
  return BODY_LOCATIONS.includes(value) ? value : undefined;
}

//the two themes an account can save, light is the default for every new account
const THEMES = ["light", "dark"];

//ends the login session and removes the cookie from the browser, then sends the message
//the cookie options have to match the ones used when it was created or the browser keeps it
function endSession(req, res, message) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.json({ message });
  });
}

app.set("trust proxy", 1);
app.use(cors({ origin: allowedOrigins, credentials: true })); // credentials lets the cookie through
app.use(express.json({ limit: "100kb" }));

//this is for saving the current user session in the database
//lets actions user did like scans they want to save, are saved under the correct user
app.use(
  session({
    //if session table doesnt exist
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// Is the process alive?
app.get("/healthz", (request, response) => {
  response.json({ ok: true });
});

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get("/readyz", async (request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ ok: true, db: "up" });
  } catch (error) {
    console.error("readyz failed:", error.message);
    response.status(503).json({ ok: false, db: "down" });
  }
});

//this is for user signup
//first checks if the email is a string, and then checks if its empty, if it is, returns null which is a falsy
//same goes for the password
app.post("/api/signup", async (request, response, next) => {
  const name =
    typeof request.body.name === "string" ? request.body.name.trim() : "";
  const email =
    typeof request.body.email === "string" ? request.body.email.trim() : "";
  const password =
    typeof request.body.password === "string" ? request.body.password : "";

  //if the email is empty, ask user to input
  if (!name) return response.status(400).json({ error: "name is required" });
  //name is only letters, no numbers or symbols
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return response
      .status(400)
      .json({ error: "Name must only contain letters" });
  }

  if (!email) return response.status(400).json({ error: "email is required" });
  //if password is less than 6 characters, ask user to input stronger and longer password
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
  if (!passwordRegex.test(password) || password.length < 6) {
    return response.status(400).json({
      error:
        "Password must contain at least one letter, one number, and one symbol",
    });
  }

  //this checks if the email is already registered, each email must be unique
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return response
        .status(409)
        .json({ error: "An account with that email already exists" });
    }

    //this is a encryption thing for security. hashes the password instead of storing it raw.
    //once hashed, stores the email and the hashed password.
    //the number 10 means the password is hashed 10 times, which makes it a lot more secure than single hashes
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email`,
      [name, email, password_hash],
    );
    response.status(201).json(rows[0]);
  } catch (error) {
    //23505 means two signups with the same email landed at the same moment, the second one is a duplicate, not a crash
    if (error.code === "23505")
      return response
        .status(409)
        .json({ error: "An account with that email already exists" });
    next(error);
  }
});

//this is for user login
//if email and password is null, returns an error since its a falsy
app.post("/api/login", async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    //if the email and password is valid, it checks if it exists in the database
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, theme FROM users WHERE email = $1",
      [email],
    );
    const user = rows[0];
    //if it doesnt exist, then it returns incorrect email or password
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    //if it does exist, it hashes the password and compares it to the one hased in the database
    //if its not the same, throws an error
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    //save the user to the session
    req.session.user = { id: user.id, email: user.email };
    //if everything passes, it returns the user id and the email, but not the password
    //the theme comes back too so the page can switch to the saved theme right after logging in
    res.json({ id: user.id, email: user.email, theme: user.theme });
  } catch (error) {
    next(error);
  }
});

//returns the currently logged-in user or an error if they are not logged in
app.get("/api/me", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  pool
    .query(
      "SELECT id, name, email, theme, encode(profile, 'base64') AS profile FROM users WHERE id = $1",
      [req.session.user.id],
    )
    //if the account no longer exists (deleted somewhere else) the old cookie should not count as logged in
    .then(({ rows }) =>
      rows[0]
        ? res.json(rows[0])
        : res.status(401).json({ error: "Not authenticated" }),
    )
    .catch(next);
});

//this is for updating the profile pic
app.post("/api/me/profile", upload.single("image"), async (req, res, next) => {
  if (!req.session.user || !req.file)
    return res.status(400).json({ error: "Invalid request" });

  pool
    .query("UPDATE users SET profile = $1 WHERE id = $2", [
      req.file.buffer,
      req.session.user.id,
    ])
    .then(() => res.json({ message: "Updated" }))
    .catch(next);
});

//this is for updating the user profile, such as name and password and profile picture
//it also saves the theme, send { "theme": "dark" } or { "theme": "light" }
app.put("/api/me", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });
  const { name, password, theme } = req.body || {};

  try {
    //the theme is checked and saved first, so a bad value is rejected before anything else changes
    if (theme !== undefined) {
      if (!THEMES.includes(theme))
        return res.status(400).json({ error: "Invalid theme" });
      await pool.query("UPDATE users SET theme = $1 WHERE id = $2", [
        theme,
        req.session.user.id,
      ]);
    }

    //if the user provided a new name, validate and update it
    if (name) {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(name))
        return res
          .status(400)
          .json({ error: "Name must only contain letters" });
      await pool.query("UPDATE users SET name = $1 WHERE id = $2", [
        name,
        req.session.user.id,
      ]);
    }

    //if the user provided a new password, validate, hash, and update it
    if (password) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
      if (!passwordRegex.test(password) || password.length < 6) {
        return res.status(400).json({
          error:
            "Password must contain at least one letter, one number, and one symbol",
        });
      }
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
        hash,
        req.session.user.id,
      ]);
    }

    //successful update
    res.json({ message: "Profile updated" });
  } catch (error) {
    next(error);
  }
});

//this is for saving a user's scan
app.post("/api/scans", upload.single("photo"), async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });
  if (!req.file) return res.status(400).json({ error: "Photo is required" });

  //save this to the database
  const { heatmap, prediction, malignant_probability, body_location } =
    req.body;

  //the stats and trends count scans by prediction, so only the two real results are allowed
  if (!["benign", "malignant"].includes(prediction))
    return res.status(400).json({ error: "Invalid prediction" });

  //the body area is optional, but if one was sent it has to be one of the known areas
  const location = cleanLocation(body_location);
  if (location === undefined)
    return res.status(400).json({ error: "Invalid body location" });

  //inserts if everything is good
  try {
    await pool.query(
      "INSERT INTO scans (user_id, photo, heatmap, prediction, malignant_probability, body_location) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        req.session.user.id,
        req.file.buffer,
        heatmap,
        prediction,
        malignant_probability,
        location,
      ],
    );
    res.json({ message: "Scan saved" });
  } catch (error) {
    next(error);
  }
});

//fetch the user scan history
app.get("/api/scans", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    //encode(photo, 'base64') turns the image into a string so the frontend can read it
    //optional ?location=left_forearm only returns scans of that body area, ?location=untagged returns the ones with no area
    const { location } = req.query;
    const params = [req.session.user.id];
    let filter = "";
    if (location === "untagged") {
      filter = " AND body_location IS NULL";
    } else if (typeof location === "string" && location) {
      params.push(location);
      filter = " AND body_location = $2";
    }

    const { rows } = await pool.query(
      `SELECT id, encode(photo, 'base64') AS photo, heatmap, prediction, malignant_probability, body_location, created_at FROM scans WHERE user_id = $1${filter} ORDER BY created_at DESC`,
      params,
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

//fetch the user scan counts for the profile page
//since is the start of today in the user's own timezone, sent by the frontend
app.get("/api/scans/stats", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  //a missing or garbled date would crash the query and show up as a 500, so it is checked here
  const since = new Date(req.query.since);
  if (isNaN(since))
    return res.status(400).json({ error: "A valid since date is required" });

  try {
    //::int turns the counts into real numbers instead of strings
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= $2)::int AS today,
         COUNT(*) FILTER (WHERE prediction = 'benign')::int AS benign,
         COUNT(*) FILTER (WHERE prediction = 'malignant')::int AS malignant,
         MAX(created_at) AS last_scan
       FROM scans WHERE user_id = $1`,
      [req.session.user.id, since],
    );
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

//fetch only the most recent scans (no photos) for the profile page
app.get("/api/scans/recent", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  //clamp the limit so nobody can ask for thousands of rows
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);

  try {
    const { rows } = await pool.query(
      "SELECT id, prediction, malignant_probability, body_location, created_at FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
      [req.session.user.id, limit],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

//fetch the numbers for the trends chart on the profile page
//weeks = how many weeks back to look, tz = the user's own timezone so a scan at 11pm lands in the right week
app.get("/api/scans/trends", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  //clamp the number of weeks so nobody can ask for a huge range
  const weeks = Math.min(Math.max(parseInt(req.query.weeks, 10) || 12, 4), 52);

  //only trust a timezone name that the runtime recognises, otherwise fall back to UTC
  let tz = "UTC";
  try {
    if (typeof req.query.tz === "string" && req.query.tz) {
      new Intl.DateTimeFormat("en", { timeZone: req.query.tz });
      tz = req.query.tz;
    }
  } catch {
    tz = "UTC";
  }

  try {
    //generate_series makes one row per week, so weeks with no scans still show up as zero
    //weeks start on Monday, and the date comes back as text so it can't shift with timezones
    const [weekly, byArea] = await Promise.all([
      pool.query(
        `WITH weeks AS (
           SELECT generate_series(
             date_trunc('week', now() AT TIME ZONE $2) - make_interval(weeks => ($3::int - 1)),
             date_trunc('week', now() AT TIME ZONE $2),
             interval '1 week'
           ) AS wk
         )
         SELECT to_char(w.wk, 'YYYY-MM-DD') AS week,
                COUNT(s.id) FILTER (WHERE s.prediction = 'benign')::int AS benign,
                COUNT(s.id) FILTER (WHERE s.prediction = 'malignant')::int AS malignant
         FROM weeks w
         LEFT JOIN scans s
           ON s.user_id = $1 AND date_trunc('week', s.created_at AT TIME ZONE $2) = w.wk
         GROUP BY w.wk
         ORDER BY w.wk`,
        [req.session.user.id, tz, weeks],
      ),
      pool.query(
        `SELECT COALESCE(body_location, 'untagged') AS location, COUNT(*)::int AS count
         FROM scans WHERE user_id = $1
         GROUP BY 1 ORDER BY count DESC`,
        [req.session.user.id],
      ),
    ]);
    res.json({ weeks: weekly.rows, locations: byArea.rows });
  } catch (error) {
    next(error);
  }
});

//this is for changing (or clearing) the body area of a scan that was already saved
//send { "body_location": "left_forearm" }, or null to clear it
app.patch("/api/scans/:id", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });

  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Invalid scan id" });

  const location = cleanLocation((req.body || {}).body_location);
  if (location === undefined)
    return res.status(400).json({ error: "Invalid body location" });

  try {
    //the user_id check means you can only change your own scans
    const { rowCount } = await pool.query(
      "UPDATE scans SET body_location = $1 WHERE id = $2 AND user_id = $3",
      [location, id, req.session.user.id],
    );
    if (rowCount === 0)
      return res.status(404).json({ error: "Scan not found" });
    res.json({ message: "Scan updated", body_location: location });
  } catch (error) {
    next(error);
  }
});

//this is for deleting the user profile
app.delete("/api/me", async (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not authenticated" });
  const { password } = req.body || {};

  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    //get the hashed password from the database
    const { rows } = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.session.user.id],
    );
    if (!rows[0]) return res.status(401).json({ error: "Not authenticated" });

    //compare the typed password to the hashed one
    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    //if it matches, delete the user and destroy the session
    await pool.query("DELETE FROM users WHERE id = $1", [req.session.user.id]);
    endSession(req, res, "Account deleted");
  } catch (error) {
    next(error);
  }
});

//destroys the session cookie to log the user out
app.post("/api/logout", (req, res) => {
  endSession(req, res, "Logged out");
});

app.use((request, response) => {
  response.status(404).json({ error: "No such route" });
});

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong on the server" });
});

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000;

await pool.query(
  fs.readFileSync(new URL("../schema.sql", import.meta.url), "utf8"),
);

//adds the theme column the first time the server starts, safe to run again every start
//existing accounts get light, which is what you want as the default
await pool.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'light'`,
);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`CORS allows: ${allowedOrigins.join(", ")}`);
});
