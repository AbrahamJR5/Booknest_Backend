require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const routerApi = require('./routes/rutas');

const app = express();
app.use(cors());
routerApi(app);
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hola desde server express");
});


app.listen(3000, () => {
    console.log("Servidor API corriendo en http://localhost:3000");
});
