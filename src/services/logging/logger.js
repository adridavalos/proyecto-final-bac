import winston from 'winston';
import config from '../../config.js';

const devLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'debug' })
    ]
});
const prodLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ level: 'error', filename:`${config.DIRNAME}/logs/errors.log` })
    ]
});


const addLogger = (req, res, next) => {

    if (process.env.NODE_ENV === 'production') {
        req.logger = prodLogger;
    } else {
        req.logger = devLogger;
    }
    req.logger.error(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
};



export default addLogger