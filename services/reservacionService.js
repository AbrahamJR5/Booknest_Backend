const db = require("../db");

class ReservacionService {
    async getAll() {
        const sql = `
            SELECT
                r.id_reservacion,
                r.fecha_reservacion,
                r.fecha_limite,
                r.estado,
                u.id_usuario,
                u.nombre AS nombre_usuario,
                l.id_libro,
                l.titulo AS titulo_libro
            FROM
                reservaciones r
            JOIN
                usuarios u ON r.id_usuario = u.id_usuario
            JOIN
                libros l ON r.id_libro = l.id_libro
            ORDER BY r.id_reservacion;
        `;
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) {
                    return reject({ error: "Error al traer los datos de reservaciones", details: err });
                }
                resolve(result);
            });
        });
    }

    async getById(id_reservacion) {
        const sql = `SELECT * FROM reservaciones WHERE id_reservacion = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [id_reservacion], (err, result) => {
                if (err) {
                    return reject({ error: "Error al consultar la reservación", details: err });
                }
                if (result.length === 0) {
                    return reject({ error: "Reservación no encontrada", status: 404 });
                }
                resolve(result[0]);
            });
        });
    }

    async create(reservacionData) {
        const { id_usuario, id_libro, fecha_limite } = reservacionData;
        return new Promise((resolve, reject) => {

            // 1. Verificar si el usuario existe
            db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id_usuario], (err, userResult) => {
                if (err) return reject({ error: "Error al verificar el usuario", details: err });
                if (userResult.length === 0) {
                    return reject({ error: `El usuario con id ${id_usuario} no existe.`, status: 404 });
                }

                // 2. Verificar si el libro existe y tiene stock
                db.query('SELECT stock FROM libros WHERE id_libro = ?', [id_libro], (err, stockResult) => {
                    if (err) return reject({ error: "Error al consultar stock del libro", details: err });
                    if (stockResult.length === 0) {
                        return reject({ error: `El libro con id ${id_libro} no existe.`, status: 404 });
                    }
                    if (stockResult[0].stock <= 0) {
                        return reject({ error: 'No hay stock disponible para este libro.', status: 400 });
                    }

                    // 3. Reducir el stock
                    db.query('UPDATE libros SET stock = stock - 1 WHERE id_libro = ?', [id_libro], (err) => {
                        if (err) return reject({ error: "Error al actualizar stock del libro", details: err });

                        // 4. Crear la reservación
                        const insertSql = 'INSERT INTO reservaciones (id_usuario, id_libro, fecha_limite) VALUES (?, ?, ?)';
                        db.query(insertSql, [id_usuario, id_libro, fecha_limite], (err, insertResult) => {
                            if (err) {
                                db.query('UPDATE libros SET stock = stock + 1 WHERE id_libro = ?', [id_libro]); // Intento de revertir
                                return reject({ error: "Error al crear la reservación", details: err });
                            }
                            resolve({ id_reservacion: insertResult.insertId, ...reservacionData });
                        });
                    });
                });
            });
        });
    }

    async update(id_reservacion, reservacionData) {
        const { estado } = reservacionData;
        if (!estado || Object.keys(reservacionData).length > 1) {
            return Promise.reject({ error: "Solo se puede actualizar el campo 'estado'", status: 400 });
        }
        if (!['pendiente', 'recogido', 'cancelado'].includes(estado)) {
            return Promise.reject({ error: 'Estado no válido.', status: 400 });
        }

        return new Promise((resolve, reject) => {
            // 1. Obtener estado actual y id_libro
            db.query('SELECT estado, id_libro FROM reservaciones WHERE id_reservacion = ?', [id_reservacion], (err, current) => {
                if (err) return reject({ error: "Error al consultar la reservación", details: err });
                if (current.length === 0) return reject({ error: "Reservación no encontrada", status: 404 });

                const { estado: estado_actual, id_libro } = current[0];

                const doUpdate = () => {
                    db.query('UPDATE reservaciones SET estado = ? WHERE id_reservacion = ?', [estado, id_reservacion], (err, result) => {
                        if (err) return reject({ error: "Error al actualizar la reservación", details: err });
                        this.getById(id_reservacion).then(resolve).catch(reject);
                    });
                };

                // 2. Si se cancela una reservación pendiente, se devuelve el stock
                if (estado_actual === 'pendiente' && estado === 'cancelado') {
                    db.query('UPDATE libros SET stock = stock + 1 WHERE id_libro = ?', [id_libro], (err) => {
                        if (err) return reject({ error: "Error al devolver stock", details: err });
                        doUpdate();
                    });
                } else {
                    doUpdate();
                }
            });
        });
    }

    async delete(id_reservacion) {
        return new Promise((resolve, reject) => {
            // 1. Obtener estado actual y id_libro para devolver stock si es necesario
            db.query('SELECT estado, id_libro FROM reservaciones WHERE id_reservacion = ?', [id_reservacion], (err, current) => {
                if (err) return reject({ error: "Error al consultar la reservación para eliminar", details: err });

                const doDelete = () => {
                    db.query('DELETE FROM reservaciones WHERE id_reservacion = ?', [id_reservacion], (err, result) => {
                        if (err) return reject({ error: "Error al eliminar la reservación", details: err });
                        if (result.affectedRows === 0) {
                            // Si no se eliminó nada, pero la consulta anterior devolvió algo,
                            // es una condición de carrera. Devolvemos el stock que quitamos.
                            if (current.length > 0 && current[0].estado === 'pendiente') {
                                db.query('UPDATE libros SET stock = stock - 1 WHERE id_libro = ?', [current[0].id_libro]);
                            }
                            return reject({ error: "Reservación no encontrada para eliminar", status: 404 });
                        }
                        resolve({ message: "Reservación eliminada", id: id_reservacion });
                    });
                };

                // 2. Si la reservación existe y está pendiente, devolver stock
                if (current.length > 0 && current[0].estado === 'pendiente') {
                    db.query('UPDATE libros SET stock = stock + 1 WHERE id_libro = ?', [current[0].id_libro], (err) => {
                        if (err) return reject({ error: "Error al devolver stock al eliminar", details: err });
                        doDelete();
                    });
                } else {
                    doDelete();
                }
            });
        });
    }
}

module.exports = new ReservacionService();
