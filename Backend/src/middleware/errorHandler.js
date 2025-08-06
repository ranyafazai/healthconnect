export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode}: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};
