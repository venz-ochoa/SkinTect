import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db/pool.js'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import multer from 'multer'

const app = express()

// CORS before the routes. Middleware registered after a route never sees that
// route's requests, which is the m4 lesson showing up in production.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const PgStore = connectPgSimple(session)
const isProd = process.env.NODE_ENV === 'production'
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.set('trust proxy', 1)
app.use(cors({ origin: allowedOrigins, credentials: true })) // credentials lets the cookie through
app.use(express.json({ limit: '100kb' }))

//this is for saving the current user session in the database
//lets actions user did like scans they want to save, are saved under the correct user 
app.use(session({
  //if session table doesnt exist
  store: new PgStore({ pool, createTableIfMissing: true }), 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,                     
    secure: isProd,                      
    sameSite: isProd ? 'none' : 'lax',   
    maxAge: 1000 * 60 * 60 * 24 * 7,     
  },
}))


// Is the process alive?
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

//this is for user signup
//first checks if the email is a string, and then checks if its empty, if it is, returns null which is a falsy
//same goes for the password
app.post('/api/signup', async (request, response, next) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
  const email = typeof request.body.email === 'string' ? request.body.email.trim() : ''
  const password = typeof request.body.password === 'string' ? request.body.password : ''

  //if the email is empty, ask user to input
  if (!name) return response.status(400).json({ error: 'name is required' })
  //name is only letters, no numbers or symbols
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return response.status(400).json({ error: 'Name must only contain letters' })
  }

  if (!email) return response.status(400).json({ error: 'email is required' })
  //if password is less than 6 characters, ask user to input stronger and longer password
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
  if (!passwordRegex.test(password) || password.length < 6) {
    return response.status(400).json({ error: 'Password must contain at least one letter, one number, and one symbol' })
  }

  //this checks if the email is already registered, each email must be unique
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return response.status(409).json({ error: 'An account with that email already exists' })
    }

  //this is a encryption thing for security. hashes the password instead of storing it raw.
  //once hashed, stores the email and the hashed password.
  //the number 10 means the password is hashed 10 times, which makes it a lot more secure than single hashes
    const password_hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email`,
      [name, email, password_hash]
    )
    response.status(201).json(rows[0])
  } catch (error) {
    next(error)
  }
})

//this is for user login
//if email and password is null, returns an error since its a falsy
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
 
  //if the email and password is valid, it checks if it exists in the database
  const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email])
  const user = rows[0]
  //if it doesnt exist, then it returns incorrect email or password
  if (!user) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
 
  //if it does exist, it hashes the password and compares it to the one hased in the database
  //if its not the same, throws an error
  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }

  //save the user to the session
  req.session.user = { id: user.id, email: user.email }
  //if everything passes, it returns the user id and the email, but not the password
  res.json({ id: user.id, email: user.email })
})

//returns the currently logged-in user or an error if they are not logged in
app.get('/api/me', async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })

  pool.query("SELECT id, name, email, encode(profile, 'base64') AS profile FROM users WHERE id = $1", [req.session.user.id])
    .then(({ rows }) => res.json(rows[0]))
    .catch(next)
})

//this is for updating the profile pic 
app.post('/api/me/profile', upload.single('image'), async (req, res, next) => {
  if (!req.session.user || !req.file) return res.status(400).json({ error: 'Invalid request' })
  
  pool.query('UPDATE users SET profile = $1 WHERE id = $2', [req.file.buffer, req.session.user.id])
    .then(() => res.json({ message: 'Updated' }))
    .catch(next)
})

//this is for updating the user profile, such as name and password and profile picture
app.put('/api/me', async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })
  const { name, password } = req.body

  try {
    //if the user provided a new name, validate and update it
    if (name) {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(name)) return res.status(400).json({ error: 'Name must only contain letters' })
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.session.user.id])
    }

    //if the user provided a new password, validate, hash, and update it
    if (password) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
      if (!passwordRegex.test(password) || password.length < 6) {
        return res.status(400).json({ error: 'Password must contain at least one letter, one number, and one symbol' })
      }
      const hash = await bcrypt.hash(password, 10)
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.session.user.id])
    }

    //successful update
    res.json({ message: 'Profile updated' })
  } catch (error) {
    next(error)
  }
})

//this is for saving a user's scan
app.post('/api/scans', upload.single('photo'), async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })
  if (!req.file) return res.status(400).json({ error: 'Photo is required' })

  //save this to the database
  const { heatmap, prediction, malignant_probability } = req.body

  //inserts if everything is good
  try {
    await pool.query(
      'INSERT INTO scans (user_id, photo, heatmap, prediction, malignant_probability) VALUES ($1, $2, $3, $4, $5)',
      [req.session.user.id, req.file.buffer, heatmap, prediction, malignant_probability]
    )
    res.json({ message: 'Scan saved' })
  } catch (error) {
    next(error)
  }
})

//fetch the user scan history
app.get('/api/scans', async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })
  
  try {
    //encode(photo, 'base64') turns the image into a string so the frontend can read it
    const { rows } = await pool.query(
      "SELECT id, encode(photo, 'base64') AS photo, heatmap, prediction, malignant_probability, created_at FROM scans WHERE user_id = $1 ORDER BY created_at DESC",
      [req.session.user.id]
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

//this is for deleting the user profile
app.delete('/api/me', async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' })
  const { password } = req.body
  
  if (!password) return res.status(400).json({ error: 'Password is required' })

  try {
    //get the hashed password from the database
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.session.user.id])
    
    //compare the typed password to the hashed one
    const match = await bcrypt.compare(password, rows[0].password_hash)
    if (!match) return res.status(401).json({ error: 'Incorrect password' })

    //if it matches, delete the user and destroy the session
    await pool.query('DELETE FROM users WHERE id = $1', [req.session.user.id])
    req.session.destroy()
    res.json({ message: 'Account deleted' })
  } catch (error) {
    next(error)
  }
})

//destroys the session cookie to log the user out
app.post('/api/logout', (req, res) => {
  req.session.destroy()
  res.json({ message: 'Logged out' })
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})