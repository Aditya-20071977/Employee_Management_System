const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/userroutes'));
app.use('/api/employees', require('./routes/emproutes'));

module.exports = app;
