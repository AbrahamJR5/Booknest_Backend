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

    
}

module.exports = new BookService(); 