
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (
    err instanceof SyntaxError && err.type === 'entity.parse.failed'
      ? 400
      : 500
  );
  const message = statusCode >= 500
    ? 'Internal Server Error'
    : (err.message || 'Request failed');

  console.error(`[ERROR] ${req.method} ${req.url} -> Status: ${statusCode}`, err);

  res.status(statusCode).json({
    error: message
  });
};

module.exports = errorHandler;