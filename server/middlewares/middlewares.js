const authRequests = require("../requests/authRequests");

const logger = require('../logger');

/**
 * Промежуточные обработчики
 */
class Middlewares {
    /**
     * Проверка авторизации. Нужна почти для всех запросов.
     */
    async isAuthorised (req, res, next) {
        try {
            const isAuth = await authRequests.isAuthorised(req.cookies.session_id);
            if (!isAuth) {
                res.sendStatus(401);
            } else {
                next();
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
