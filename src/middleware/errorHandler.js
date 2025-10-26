// export const errorHandler = (err, req, res, next) => {
//   console.error('Error:', err);

//   if (err.message?.includes('Could not fetch data from')) {
//     return res.status(503).json({
//       error: 'External data source unavailable',
//       details: err.message
//     });
//   }

//   res.status(500).json({
//     error: 'Internal server error',
//     details: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// };

// // Catch-all 404 handler (must come before errorHandler)
// app.use((req, res, next) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl
//   });
// });

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // External API failure
  if (err.message?.includes('Could not fetch data from')) {
    return res.status(503).json({
      error: 'External data source unavailable',
      details: err.message
    });
  }

  // Generic internal server error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};