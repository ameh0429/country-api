import pool from '../config/database.js';

export const upsertCountry = async (countryData) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url
    } = countryData;

    // Check if country exists (case-insensitive)
    const [existing] = await connection.query(
      'SELECT id FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (existing.length > 0) {
      // Update existing country
      await connection.query(
        `UPDATE countries 
         SET capital = ?, region = ?, population = ?, currency_code = ?, 
             exchange_rate = ?, estimated_gdp = ?, flag_url = ?, 
             last_refreshed_at = CURRENT_TIMESTAMP
         WHERE LOWER(name) = LOWER(?)`,
        [capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, name]
      );
    } else {
      // Insert new country
      await connection.query(
        `INSERT INTO countries 
         (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url]
      );
    }
  } finally {
    connection.release();
  }
};

export const getAllCountries = async (filters = {}) => {
  let query = 'SELECT * FROM countries WHERE 1=1';
  const params = [];

  if (filters.region) {
    query += ' AND region = ?';
    params.push(filters.region);
  }

  if (filters.currency) {
    query += ' AND currency_code = ?';
    params.push(filters.currency);
  }

  // Sorting
  if (filters.sort === 'gdp_desc') {
    query += ' ORDER BY estimated_gdp DESC';
  } else if (filters.sort === 'gdp_asc') {
    query += ' ORDER BY estimated_gdp ASC';
  } else if (filters.sort === 'population_desc') {
    query += ' ORDER BY population DESC';
  } else if (filters.sort === 'population_asc') {
    query += ' ORDER BY population ASC';
  } else {
    query += ' ORDER BY name ASC';
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

export const getCountryByName = async (name) => {
  const [rows] = await pool.query(
    'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
    [name]
  );
  return rows[0];
};

export const deleteCountryByName = async (name) => {
  const [result] = await pool.query(
    'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
    [name]
  );
  return result.affectedRows > 0;
};

export const getCountriesCount = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM countries');
  return rows[0].count;
};

export const updateLastRefreshTimestamp = async () => {
  await pool.query(
    `UPDATE metadata 
     SET value = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE key_name = 'last_refresh_timestamp'`,
    [new Date().toISOString()]
  );
};

export const getLastRefreshTimestamp = async () => {
  const [rows] = await pool.query(
    "SELECT value FROM metadata WHERE key_name = 'last_refresh_timestamp'"
  );
  return rows[0]?.value || null;
};

export const getTopCountriesByGDP = async (limit = 5) => {
  const [rows] = await pool.query(
    'SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?',
    [limit]
  );
  return rows;
};