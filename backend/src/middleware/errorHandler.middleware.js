export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: err.success || false,
      name: err.name || "Error",
      message: err.message || "Something went wrong",
      ...(err.error && { error: err.error })
    });
  };
  