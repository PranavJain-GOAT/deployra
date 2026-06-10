const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const routes = require('./routes');


const app = express();

// Trust proxy for express-rate-limit behind Render load balancer
app.set('trust proxy', 1);

// Custom lightweight cookie parser middleware (avoids external dependency bloat)
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
  next();
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Safely resolve FRONTEND_URL — guard against the "FRONTEND_URL=..." prefix corruption bug
const safeFrontendUrl = (process.env.FRONTEND_URL || '').replace(/^FRONTEND_URL=/, '').trim();

const allowedOrigins = [
  safeFrontendUrl,
  'https://deployra.vercel.app', // Always allow the production frontend
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));



// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Mounted Routes
app.use('/api/v1', routes);

// Fallback Route for Google OAuth redirects (which may lack the /api/v1 prefix)
const { googleCallback } = require('./controllers/auth.controller');
app.get('/auth/google/callback', googleCallback);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
