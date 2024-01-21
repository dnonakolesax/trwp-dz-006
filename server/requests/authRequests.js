const redis = require('../redis/redis');
const sql = require('../db/pgSQL');
const uuid = require('uuid');
const {toBase64} = require("request/lib/helpers");
const setupRequest = require('./setupRequest');
const {max} = require("pg/lib/defaults");

const authoriseRequestFile = 'auth__authorise.sql';

const AUTH_TIMEOUT = 600; //10 минут
const AUTH_MAX_ATTEMPTS = 5;

/**
 * Клас запросов типа авторизации
 */
class authRequests {
    /**
     * Проверка авторизации
     * @param sessionId - id сессии
     * @returns {Promise<boolean>} - результат запроса
     */
    async isAuthorised(sessionId) {
        console.log(sessionId);
        if (sessionId !== undefined) {
            let userData;
            try {
                userData = await redis.get(sessionId);
            } catch (e) {
                throw e;
            }
            return userData !== undefined;
        } else {
            return false;
        }
    }

    /**
     * Попытка авторазации пользователя
     * @param login - логин
     * @param password - пароль
     * @returns {Promise<number|*>} - id пользователя в случае успеха, иначе ничего
     */
    async authorise(login, password) {
        const query = setupRequest.fromFile(authoriseRequestFile, {login: login, password: password});
        try {
            const data = await sql.makeRequest(query);
            if (!data.rows[0]) {
                return -1;
            } else {
                const uniqueRandomID = toBase64(uuid.v4());
                await redis.set(uniqueRandomID, data.rows[0].id);
                return uniqueRandomID;
            }
        } catch (e) {
            throw e;
        }
    }

    async logout(sessionId) {
        try {
            await redis.del(sessionId);
        } catch (e) {
            throw e;
        }
    }

    async checkSpam(address, maxAttempts = null, timeout = null) {
        if (!maxAttempts) {
            maxAttempts = AUTH_MAX_ATTEMPTS;
            timeout = AUTH_TIMEOUT;
        }
        try {
            const attempts = Number(await redis.get(address));
            if (attempts) {
                if (attempts > Number(maxAttempts)) {
                    return true;
                } else {
                    await redis.incr(address);
                }
            } else {
                await redis.set(address, 1, timeout);
            }
            return false;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = new authRequests();
