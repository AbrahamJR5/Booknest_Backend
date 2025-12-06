const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API funcionando");
});

// Probar que sí funciona la conexión
app.get("/test-db", (req, res) => {
    db.query("SELECT 1 + 1 AS resultado", (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log("Servidor API corriendo en http://localhost:3000");
});
