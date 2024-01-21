const {Router} = require('express');
const authRequests = require('../requests/authRequests');
const logger = require("../logger");
const router = Router();
const crypto = require('crypto');

/**
 * Обработка запроса проверки авторизации
 */
router.get('/is_authorized', async (req, res) => {
    try {
        const isAuthorised = await authRequests.isAuthorised(req.cookies.session_id);
        res.send({'body': {'is_authorized': isAuthorised}});
    } catch (e) {
        res.statusCode = 500;
        res.send({'error': {'redis_error': e.toString()}});
    }
})

/**
 * Обработка запроса авторизации
 */
router.post('/authorise', async (req,res) => {
    const login = req.body.body.login;
    const password = req.body.body.password;
    const hashPass = crypto.createHash('sha256').update(password).digest('hex');
    try {
        const spam = await authRequests.checkSpam(req.socket.remoteAddress);
        if (spam) {
            res.sendStatus(429);
        } else {
            const id = await authRequests.authorise(login, hashPass);
            if (id === -1) {
                logger.logRequestError('No such user');
                res.sendStatus(401);
            } else {
                //в принципе нет особа смысла её подписывать, так как всё равно стоит httponly
                res.cookie('session_id', id, {httpOnly: true, maxAge: 86400000, signed: false});
                res.sendStatus(200);
            }
        }
    } catch (e) {
        res.statusCode = 500;
        res.send({'error': {'db_error': e.toString()}});
    }
})

/**
 * Обработка запроса выхода из пользователя
 */
router.post('/logout', async (req, res) => {
    const sessionId = req.cookies.session_id;
    if (sessionId !== undefined) {
        await authRequests.logout(sessionId);
        res.clearCookie('session_id');
        res.sendStatus(200);
    } else {
        res.sendStatus(200);
    }
})

module.exports = router;
