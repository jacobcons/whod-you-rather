const express = require("express");
const hogan = require("hogan.js");
const mustacheExpress = require('mustache-express');

const app = express();

app.use(express.static(__dirname + "/static"));

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get("/", require("./routes/index.js"));
app.get("/game", require("./routes/game.js"));

app.listen(8080);
