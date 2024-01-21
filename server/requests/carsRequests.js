const sql = require('../db/pgSQL');
const path = require('path');
const fs = require('fs');
const redis = require('../redis/redis');
const setupRequest = require('./setupRequest');

const carsRequestFile = 'cars.sql';
const carShipmentIdRequestFile = 'cars__shipmentId.sql';

/**
 * Класс запросов к автомобилям
 */
class carRequests {
    /**
     * Получить все автомобили
     * @returns {Promise<*|*[]|*[]>} - массив автомобилей
     */
    async getCars() {
        const query = setupRequest.fromFile(carsRequestFile);
        try {
            let cars = await redis.getDictArray('cars');
            if (cars !== null) {
                return cars;
            } else {
                const data = await sql.makeRequest(query);
                cars = data.rows;
                cars.forEach((car) => {
                    const picPath = path.join(__dirname, '../uploads/', car.pic);
                    const pic = fs.readFileSync(picPath);
                    const extension = car.pic.split('.')[1];
                    car.image = 'data:image/' + extension + ';base64, ' + Buffer.from(pic).toString('base64');
                });
                await redis.setDictArray('cars', cars);
                return cars;
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    /**
     * Проверить, занят ли автомобиль
     * @param carPlate - номер автомобился
     * @param exceptId - id исключаемого рейса. Применяется тогда, когда нужно найти автомобили, на которые можно переназначить рейс.
     * @returns {Promise<boolean>}
     */
    async isBusy(carPlate, exceptId = null) {
        const shipments = await redis.getDictArray('shipments');
        if (shipments !== null) {
            for (const shipment of shipments) {
                if (shipment.car_plate === carPlate) {
                    return true;
                }
            }
            return false;
        } else {
            const query = setupRequest.fromFile(carShipmentIdRequestFile, {carPlate});
            try {
                const data = await sql.makeRequest(query);
                if (data.rowCount !== 0) {
                    return data.rows[0].id !== exceptId;
                }
                return false;
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    }
}

module.exports = new carRequests();
