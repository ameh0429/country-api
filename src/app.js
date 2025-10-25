import express from 'express';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import countryRoutes from './routes/countryRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', countryRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Country API Server',
    version: '1.0.0',
    endpoints: {
      refresh: 'POST /api/countries/refresh',
      getAll: 'GET /api/countries',
      getOne: 'GET /api/countries/:name',
      delete: 'DELETE /api/countries/:name',
      status: 'GET /api/status',
      image: 'GET /api/countries/image'
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();