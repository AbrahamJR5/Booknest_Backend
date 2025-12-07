const db = require("../db");

class BookService {
    async getAll() {
        const sql = `
            SELECT
                l.id_libro,
                l.titulo,
                l.autor,
                l.descripcion,
                l.imagen,
                l.stock,
                c.nombre AS categoria
            FROM
                libros l
            JOIN
                categorias c ON l.id_categoria = c.id_categoria
            ORDER BY l.id_libro;
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) {
                    return reject({ error: "Error al traer los datos de libros", details: err });
                }

                resolve(result);
            });
        });
    }

    async getById(id_libro) {
        const sql = `SELECT * FROM libros WHERE id_libro = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [id_libro], (err, result) => {
                if (err) {
                    return reject({ error: "Error al consultar el libro", details: err });
                }
    
                if (result.length === 0) {
                    return reject({ error: "Libro no encontrado", status: 404 });
                }
                resolve(result[0]);
            });
        });
    }

    async create(bookData) {
        const { titulo, autor, descripcion, imagen, stock, id_categoria } = bookData;
        const sql = 'INSERT INTO libros (titulo, autor, descripcion, imagen, stock, id_categoria) VALUES (?, ?, ?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            db.query(sql, [titulo, autor, descripcion, imagen, stock, id_categoria], (err, result) => {
                if (err) {
                    return reject({ error: "Error al crear el libro", details: err });
                }
                
                resolve({ id_libro: result.insertId, ...bookData });
            });
        });
    }

    async update(id_libro, bookData) {
        const fields = Object.keys(bookData);
        if (fields.length === 0) {
            return Promise.reject({ error: "No hay campos para actualizar", status: 400 });
        }

        const setClauses = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(bookData), id_libro];

        const sql = `UPDATE libros SET ${setClauses} WHERE id_libro = ?`;

        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    return reject({ error: "Error al actualizar el libro", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Libro no encontrado para actualizar", status: 404 });
                }
                
                this.getById(id_libro)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    async delete(id_libro) {
        const sql = 'DELETE FROM libros WHERE id_libro = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [id_libro], (err, result) => {
                if (err) {
                    return reject({ error: "Error al eliminar el libro", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Libro no encontrado para eliminar", status: 404 });
                }
                resolve({ message: "Libro eliminado", id: id_libro });
            });
        });
    }
}

module.exports = new BookService(); 
