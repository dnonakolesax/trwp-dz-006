const {Router} = require('express');
const authRequests = require('../requests/authRequests');
const carRequests = require('../requests/carsRequests');
const middlewares = require("../middlewares/middlewares");
const router = Router();

router.use(middlewares.isAuthorised);

/**
 * Обработка запроса получения всех автомобилей
 */
router.get('', async (req, res) => {
    try {
        const cars = await carRequests.getCars();
        res.send(cars);
    } catch (e) {
        res.statusCode = 500;
        res.send({'error': {'sql_error': e.toString()}});
    }
})

module.exports = router;
