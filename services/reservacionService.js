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
            ORDER BY r.fecha_reservacion DESC;
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
            db.getConnection((err, connection) => {
                if (err) return reject({ error: "Error de conexión a la BD", details: err });

                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return reject({ error: "Error al iniciar transacción", details: err });
                    }

                    connection.query('SELECT stock FROM libros WHERE id_libro = ? FOR UPDATE', [id_libro], (err, stockResult) => {
                        if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al consultar stock", details: err }); });

                        if (stockResult.length === 0 || stockResult[0].stock <= 0) {
                            return connection.rollback(() => { connection.release(); reject({ error: 'No hay stock disponible para este libro.', status: 400 }); });
                        }

                        connection.query('UPDATE libros SET stock = stock - 1 WHERE id_libro = ?', [id_libro], (err) => {
                            if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al actualizar stock", details: err }); });

                            const insertSql = 'INSERT INTO reservaciones (id_usuario, id_libro, fecha_limite) VALUES (?, ?, ?)';
                            connection.query(insertSql, [id_usuario, id_libro, fecha_limite], (err, insertResult) => {
                                if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al crear la reservación", details: err }); });

                                connection.commit(err => {
                                    if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al confirmar la transacción", details: err }); });
                                    
                                    connection.release();
                                    resolve({ id_reservacion: insertResult.insertId, ...reservacionData });
                                });
                            });
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
            db.getConnection((err, connection) => {
                if (err) return reject({ error: "Error de conexión a la BD", details: err });

                connection.beginTransaction(err => {
                    if (err) { connection.release(); return reject({ error: "Error al iniciar transacción", details: err }); }

                    connection.query('SELECT estado, id_libro FROM reservaciones WHERE id_reservacion = ? FOR UPDATE', [id_reservacion], (err, current) => {
                        if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al consultar la reservación", details: err }); });
                        if (current.length === 0) return connection.rollback(() => { connection.release(); reject({ error: "Reservación no encontrada", status: 404 }); });

                        const { estado: estado_actual, id_libro } = current[0];

                        const doUpdate = () => {
                            connection.query('UPDATE reservaciones SET estado = ? WHERE id_reservacion = ?', [estado, id_reservacion], (err) => {
                                if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al actualizar la reservación", details: err }); });
                                
                                connection.commit(err => {
                                    if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al confirmar la transacción", details: err }); });
                                    connection.release();
                                    this.getById(id_reservacion).then(resolve).catch(reject);
                                });
                            });
                        };

                        if (estado_actual === 'pendiente' && estado === 'cancelado') {
                            connection.query('UPDATE libros SET stock = stock + 1 WHERE id_libro = ?', [id_libro], (err) => {
                                if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al devolver stock", details: err }); });
                                doUpdate();
                            });
                        } else {
                            doUpdate();
                        }
                    });
                });
            });
        });
    }

    async delete(id_reservacion) {
        return new Promise((resolve, reject) => {
            db.getConnection((err, connection) => {
                if (err) return reject({ error: "Error de conexión a la BD", details: err });

                connection.beginTransaction(err => {
                    if (err) { connection.release(); return reject({ error: "Error al iniciar transacción", details: err }); }

                    connection.query('SELECT estado, id_libro FROM reservaciones WHERE id_reservacion = ? FOR UPDATE', [id_reservacion], (err, current) => {
                        if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al consultar la reservación", details: err }); });
                        
                        const doDelete = () => {
                            connection.query('DELETE FROM reservaciones WHERE id_reservacion = ?', [id_reservacion], (err, result) => {
                                if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al eliminar la reservación", details: err }); });
                                if (result.affectedRows === 0) return connection.rollback(() => { connection.release(); reject({ error: "Reservación no encontrada para eliminar", status: 404 }); });
                                
                                connection.commit(err => {
                                    if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al confirmar la transacción", details: err }); });
                                    connection.release();
                                    resolve({ message: "Reservación eliminada", id: id_reservacion });
                                });
                            });
                        };

                        if (current.length > 0 && current[0].estado === 'pendiente') {
                            connection.query('UPDATE libros SET stock = stock + 1 WHERE id_libro = ?', [current[0].id_libro], (err) => {
                                if (err) return connection.rollback(() => { connection.release(); reject({ error: "Error al devolver stock", details: err }); });
                                doDelete();
                            });
                        } else {
                            doDelete();
                        }
                    });
                });
            });
        });
    }
}

module.exports = new ReservacionService();
