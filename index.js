const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente.');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});
