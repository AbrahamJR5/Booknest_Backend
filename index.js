require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const routerApi = require('./routes/rutas');

const app = express();
app.use(cors());
app.use(express.json()); // Este middleware debe ir ANTES de las rutas para que req.body funcione.

routerApi(app);

app.get("/", (req, res) => {
    res.send("Hola desde server express");
});


app.listen(3000, () => {
    console.log("Servidor API corriendo en http://localhost:3000");
});
