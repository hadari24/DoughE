function logger(req, res, next) {
    const start = Date.now();
    const timeStamp = new Date().toISOString();
    
    res.on('finish', () => {
        const duration = Date.now() - start; // Calculate the duration of the request
        console.log(`[${timeStamp}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`); // creating the log message with method, path, status code and duration
    });
    next();

}
module.exports = logger;