const express = require('express');
const logger = require('morgan');
const { handleNotFound, handleDefaultError } = require('./errorHandler');

const app = express();

const api = require('./routes/api');

app.use(logger('dev'));
app.use(express.json());

app.use('/api', api);

app.use(handleNotFound);
app.use(handleDefaultError);

module.exports = app;
