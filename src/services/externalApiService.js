import axios from 'axios';

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

export const fetchCountriesData = async () => {
  try {
    const response = await axios.get(COUNTRIES_API, { timeout: 10000 });
    return response.data;
  } catch (error) {
    throw new Error(`Could not fetch data from REST Countries API: ${error.message}`);
  }
};

export const fetchExchangeRates = async () => {
  try {
    const response = await axios.get(EXCHANGE_RATE_API, { timeout: 10000 });
    return response.data.rates;
  } catch (error) {
    throw new Error(`Could not fetch data from Exchange Rate API: ${error.message}`);
  }
};