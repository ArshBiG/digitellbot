require('dotenv').config();

const bot = require('./bot/index');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {

  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('Server running on port 3000');
});
