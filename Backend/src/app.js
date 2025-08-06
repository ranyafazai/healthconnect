const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
