'use strict';

const express = require('express');
const app = express();
app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser('base64,0YDQujYg0LvRg9GH0YjQsNGPINC60LDRhNC10LTRgNCwINC90LAg0L/Qu9Cw0L3QtdGC0LU='));

require('dotenv').config();

const middlewares = require('./middlewares/middlewares');

const logger = require('./logger');

const port = process.env.PORT || 8001;

app.use(middlewares.logAll);

app.use('', require('./routes/cors'));
app.use('/api/v1', require('./routes/authRoutes'));
app.use('/api/v1/cars', require('./routes/carsRoutes'));
app.use('/api/v1/cargos', require('./routes/cargosRoutes'));
app.use('/api/v1/shipments', require('./routes/shipmentsRoutes'));
app.use('/api/v1/destinations', require('./routes/destinationsRoutes'));


app.listen(port, function () {
    logger.logStartup();
});
