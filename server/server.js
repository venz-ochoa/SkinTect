import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db/pool.js'

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

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

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
  const email = typeof request.body.email === 'string' ? request.body.email.trim() : ''
  const password = typeof request.body.password === 'string' ? request.body.password : ''

  //if the email is empty, ask user to input
  if (!email) return response.status(400).json({ error: 'email is required' })
  //if password is less than 6 characters, ask user to input stronger and longer password
  if (password.length < 6) {
    return response.status(400).json({ error: 'password must be at least 6 characters' })
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
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email, password_hash]
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
 
  //if everything passes, it returns the user id and the email, but not the password
  res.json({ id: user.id, email: user.email })
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