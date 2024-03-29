const {Router} = require('express');
const destinationsRequests = require('../requests/destinationsRequests');
const middlewares = require("../middlewares/middlewares");
const router = Router();

router.use(middlewares.isAuthorised);

/**
 * Обработка запроса получения всех возможных пунктов назначения
 */
router.get('', async (req, res) => {
    try {
        const destinations = await destinationsRequests.getDestinations();
        res.send(destinations);
    } catch (e) {
        res.statusCode = 500;
        res.send({'error': {'sql_error': e.toString()}});
    }
})

module.exports = router;
