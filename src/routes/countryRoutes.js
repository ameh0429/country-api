import express from 'express';
import {
  refreshCountries,
  getCountries,
  getCountry,
  deleteCountry,
  getStatus,
  getSummaryImage
} from '../controllers/countryController.js';

const router = express.Router();

// POST /countries/refresh - Refresh country data from external APIs
router.post('/countries/refresh', refreshCountries);

// GET /countries - Get all countries with optional filters
router.get('/countries', getCountries);

// GET /countries/image - Get summary image
router.get('/countries/image', getSummaryImage);

// GET /countries/:name - Get a specific country by name
router.get('/countries/:name', getCountry);

// DELETE /countries/:name - Delete a country by name
router.delete('/countries/:name', deleteCountry);

// GET /status - Get API status
router.get('/status', getStatus);

export default router;