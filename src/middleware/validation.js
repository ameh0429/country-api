export const validateCountryData = (req, res, next) => {
  const { name, population, currency_code } = req.body;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'is required';
  }

  if (population === undefined || population === null || population === '') {
    errors.population = 'is required';
  } else if (isNaN(population) || population < 0) {
    errors.population = 'must be a positive number';
  }

  if (!currency_code || currency_code.trim() === '') {
    errors.currency_code = 'is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};