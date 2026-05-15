function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred. Please try again later.',
            details: {}
        }
    });
}

module.exports = errorHandler;