const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "***CONTRASEÑA-REMOVIDA***", // ← AQUI PON LA TUYA
    database: "libreria"
});

db.connect((err) => {
    if (err) {
        console.error("Error conectando a MySQL:", err);
        return;
    }
    console.log("Conectado a MySQL correctamente");
});

module.exports = db;
