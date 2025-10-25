import {
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  upsertCountry,
  updateLastRefreshTimestamp,
  getCountriesCount,
  getLastRefreshTimestamp,
  getTopCountriesByGDP
} from '../models/countryModel.js';
import { fetchCountriesData, fetchExchangeRates } from '../services/externalApiService.js';
import { generateSummaryImage } from '../services/imageService.js';

// Helper function to generate random GDP multiplier
const getRandomMultiplier = () => {
  return Math.random() * (2000 - 1000) + 1000;
};

// Helper function to calculate estimated GDP
const calculateEstimatedGDP = (population, exchangeRate) => {
  if (!exchangeRate || exchangeRate === 0) return null;
  const multiplier = getRandomMultiplier();
  return (population * multiplier) / exchangeRate;
};

export const refreshCountries = async (req, res, next) => {
  try {
    // Fetch data from external APIs
    const [countriesData, exchangeRates] = await Promise.all([
      fetchCountriesData(),
      fetchExchangeRates()
    ]);

    // Process each country
    for (const country of countriesData) {
      let currencyCode = null;
      let exchangeRate = null;
      let estimatedGDP = 0;

      // Extract currency code
      if (country.currencies && country.currencies.length > 0) {
        currencyCode = country.currencies[0].code;
        
        // Get exchange rate if currency exists
        if (currencyCode && exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
          estimatedGDP = calculateEstimatedGDP(country.population, exchangeRate);
        } else if (currencyCode) {
          // Currency exists but no exchange rate found
          exchangeRate = null;
          estimatedGDP = null;
        }
      }

      const countryData = {
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGDP,
        flag_url: country.flag || null
      };

      await upsertCountry(countryData);
    }

    // Update global refresh timestamp
    await updateLastRefreshTimestamp();

    // Generate summary image
    const totalCountries = await getCountriesCount();
    const topCountries = await getTopCountriesByGDP(5);
    const lastRefreshed = await getLastRefreshTimestamp();

    await generateSummaryImage({
      totalCountries,
      topCountries,
      lastRefreshed
    });

    res.json({
      message: 'Countries data refreshed successfully',
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed
    });
  } catch (error) {
    next(error);
  }
};

export const getCountries = async (req, res, next) => {
  try {
    const filters = {
      region: req.query.region,
      currency: req.query.currency,
      sort: req.query.sort
    };

    const countries = await getAllCountries(filters);
    res.json(countries);
  } catch (error) {
    next(error);
  }
};

export const getCountry = async (req, res, next) => {
  try {
    const { name } = req.params;
    const country = await getCountryByName(name);

    if (!country) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }

    res.json(country);
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const { name } = req.params;
    const deleted = await deleteCountryByName(name);

    if (!deleted) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }

    res.json({
      message: 'Country deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const totalCountries = await getCountriesCount();
    const lastRefreshed = await getLastRefreshTimestamp();

    res.json({
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed
    });
  } catch (error) {
    next(error);
  }
};

export const getSummaryImage = async (req, res, next) => {
  try {
    const imagePath = path.join(process.cwd(), 'cache', 'summary.png');
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Summary image not found'
      });
    }

    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
};

// Import for image endpoint
import fs from 'fs';
import path from 'path';