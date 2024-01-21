const {createClient} = require('redis');
const logger = require('../logger');

/**
 * Адаптер для работы с бд Redis
 */
class redisAdapter {
    constructor(config = {}) {
        this.host = config.host || process.env.REDISHOST;
        this.port = config.port || process.env.REDISPORT;
        this.userName = config.userName || process.env.REDISUSER;
        this.password = config.password || process.env.REDISPASSWORD;
        this.redisClient = createClient({
            username: this.userName,
            password: this.password,
            socket: {
                host: this.host,
                port: this.port,
            }
        });
    }

    /**
     * Подключение к redis
     * @returns {Promise<void>} - объект подключения
     */
    async connect() {
        try {
            await this.redisClient.connect();
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        }
    }

    /**
     * Отключение от redis
     */
    async disconnect() {
        await this.redisClient.disconnect();
    }

    /**
     * Получения значения по ключу
     * @param key - ключ
     * @returns {Promise<string>} - результат запроса
     */
    async get(key) {
        logger.logRedisQuery('get', key);
        try {
            await this.connect();
            return await this.redisClient.get(key);
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Получение массива мап по ключу
     * @param key - ключ
     * @returns {Promise<null|*[]>} - результат запроса
     */
    async getDictArray(key) {
        try {
            await this.connect();
            let i = 0;
            let result = [];
            let currKey = `${key}:${i}`;
            let value = await this.redisClient.hGetAll(currKey);
            while (Object.keys(value).length) {
                result.push(value);
                i += 1;
                currKey = `${key}:${i}`;
                logger.logRedisQuery('mget', currKey);
                value = await this.redisClient.hGetAll(currKey);
            }
            if (i === 0) {
                return null;
            }
            return result;
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Установка пары ключ-значение
     * @param key - ключ
     * @param value - значение
     * @param expires - длительность хранения ключа (1 день по умолчанию, -1 - не задавать)
     */
    async set(key, value, expires = 86400) {
        logger.logRedisQuery('set', key, value);
        try {
            await this.connect();
            await this.redisClient.set(key, value);
            if (expires > 0) {
                await this.redisClient.expire(key, Number(expires));
            }
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Вставка массива мап
     * @param key - ключ
     * @param values - значения
     */
    async setDictArray(key, values) {
        try {
            await this.connect();
            for (let i = 0; i < values.length; i++) {
                const currKey = `${key}:${i}`;
                logger.logRedisQuery('hset', currKey);
                await this.redisClient.hSet(currKey, values[i]);
            }
            console.log()
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Удаление по ключу
     * @param key - ключ
     */
    async del(key) {
        logger.logRedisQuery('del', key);
        try {
            await this.connect();
            await this.redisClient.del(key);
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }

    /**
     * Увелечение значения на 1
     * @param key - ключ
     */
    async incr(key) {
        logger.logRedisQuery('incr', key);
        try {
            await this.connect();
            await this.redisClient.incr(key);
        } catch (e) {
            logger.logRedisError(e.toString());
            throw e;
        } finally {
            await this.disconnect();
        }
    }
}

module.exports = new redisAdapter();
