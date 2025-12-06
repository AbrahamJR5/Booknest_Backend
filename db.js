const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'libreria'
});

db.connect(err => {
    if (err) {
        console.log('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

module.exports = db;
