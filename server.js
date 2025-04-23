const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot/index'); // این همون فایلیه که bot ازش export شده

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// پورت و لاگ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});
