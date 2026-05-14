function logger(req, res, next) {
    start = Date.now();
    timeStamp = new Date().toISOString();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timeStamp}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();

}
module.exports = logger;