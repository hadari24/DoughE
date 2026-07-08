function logger(req, res, next) {
    const start = Date.now();
    const timeStamp = new Date().toISOString();
    
    res.on('finish', () => {
        const duration = Date.now() - start; // calc the dur
        console.log(`[${timeStamp}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`); // log message : method, path, status code , dur
    });
    next();

}
module.exports = logger;