const db = require("../db");

class CategoryService {
    async getAll() {
        const sql = `SELECT * FROM categorias ORDER BY id_categoria;`;
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) {
                    return reject({ error: "Error al traer los datos de categorías", details: err });
                }
                resolve(result);
            });
        });
    }

    async getById(id_categoria) {
        const sql = `SELECT * FROM categorias WHERE id_categoria = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [id_categoria], (err, result) => {
                if (err) {
                    return reject({ error: "Error al consultar la categoría", details: err });
                }
                if (result.length === 0) {
                    return reject({ error: "Categoría no encontrada", status: 404 });
                }
                resolve(result[0]);
            });
        });
    }

    async create(categoriaData) {
        const { nombre } = categoriaData;
        const sql = 'INSERT INTO categorias (nombre) VALUES (?)';
        return new Promise((resolve, reject) => {
            db.query(sql, [nombre], (err, result) => {
                if (err) {
                    return reject({ error: "Error al crear la categoría", details: err });
                }
                resolve({ id_categoria: result.insertId, ...categoriaData });
            });
        });
    }

    async update(id_categoria, categoriaData) {
        const { nombre } = categoriaData;
        const sql = `UPDATE categorias SET nombre = ? WHERE id_categoria = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [nombre, id_categoria], (err, result) => {
                if (err) {
                    return reject({ error: "Error al actualizar la categoría", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Categoría no encontrada para actualizar", status: 404 });
                }
                this.getById(id_categoria)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    async delete(id_categoria) {
        const sql = 'DELETE FROM categorias WHERE id_categoria = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [id_categoria], (err, result) => {
                if (err) {
                    return reject({ error: "Error al eliminar la categoría", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Categoría no encontrada para eliminar", status: 404 });
                }
                resolve({ message: "Categoría eliminada", id: id_categoria });
            });
        });
    }
}

module.exports = new CategoryService();
