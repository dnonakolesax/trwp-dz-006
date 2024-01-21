const authRequests = require("../requests/authRequests");

const logger = require('../logger');

const MAX_BD_REQUESTS = 10;
const MAX_BD_REQUESTS_TIMEOUT = 10;

/**
 * Промежуточные обработчики
 */
class Middlewares {
    /**
     * Проверка авторизации. Нужна почти для всех запросов.
     */
    async isAuthorised (req, res, next) {
        try {
            const spam = await authRequests.checkSpam(`entries-${req.cookies.session_id}`, MAX_BD_REQUESTS, MAX_BD_REQUESTS_TIMEOUT);
            if (spam) {
                res.sendStatus(429);
            } else {
                const isAuth = await authRequests.isAuthorised(req.cookies.session_id);
                if (!isAuth) {
                    res.sendStatus(401);
                } else {
                    next();
                }
            }
        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.send({'error': {'sql_error': e.toString()}});
        }
    }

    /**
     * Параметры CORS, отсылаемые при каждом запросе
     */
    async corsAll(req, res, next) {
        res.header("Access-Control-Allow-Origin", process.env.FRONTENDURL + ':' + process.env.FRONTENDPORT);
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    };

    /**
     * Логирование запросов
     */
    async logAll(req, res, next) {
        const path = req.path;
        const sessionId = req.cookies.session_id;
        logger.logRequest(req.method, path, req.body, sessionId);
        next();
        logger.logResponse(req.method, path, req.body, res.statusCode, sessionId);
    }
}

module.exports = new Middlewares();
