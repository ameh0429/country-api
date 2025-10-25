export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message?.includes('Could not fetch data from')) {
    return res.status(503).json({
      error: 'External data source unavailable',
      details: err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};