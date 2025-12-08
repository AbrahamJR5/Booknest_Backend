const db = require("../db");

class UsuarioService {
    async getAll() {
        const sql = `SELECT id_usuario, nombre, email, password, fecha_registro, tipo FROM usuarios ORDER BY id_usuario;`;
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) {
                    return reject({ error: "Error al traer los datos de usuarios", details: err });
                }
                resolve(result);
            });
        });
    }

    async getById(id_usuario) {
        const sql = `SELECT id_usuario, nombre, email, password, fecha_registro, tipo FROM usuarios WHERE id_usuario = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [id_usuario], (err, result) => {
                if (err) {
                    return reject({ error: "Error al consultar el usuario", details: err });
                }
                if (result.length === 0) {
                    return reject({ error: "Usuario no encontrado", status: 404 });
                }
                resolve(result[0]);
            });
        });
    }

    async create(usuarioData) {
        const { nombre, email, password, claveAdmin } = usuarioData;
        const CLAVE_ADMIN = "BOOKNESTADMIN2024";
        let tipo = "usuario";

        if (claveAdmin === CLAVE_ADMIN) {
            tipo = "admin";
        }

        const sql = 'INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, ?)';

        return new Promise((resolve, reject) => {
            db.query(sql, [nombre, email, password, tipo], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return reject({ error: 'El email ya está registrado.', status: 400 });
                    }
                    return reject({ error: "Error al crear el usuario", details: err });
                }

                const usuarioSinPassword = { id_usuario: result.insertId, nombre, email, tipo };

                resolve(usuarioSinPassword);
            });
        });
    }


    async update(id_usuario, usuarioData) {
        const fields = Object.keys(usuarioData);
        if (fields.length === 0) {
            return Promise.reject({ error: "No hay campos para actualizar", status: 400 });
        }


        const setClauses = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(usuarioData), id_usuario];

        const sql = `UPDATE usuarios SET ${setClauses} WHERE id_usuario = ?`;

        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return reject({ error: 'El email ya está registrado.', status: 400 });
                    }
                    return reject({ error: "Error al actualizar el usuario", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Usuario no encontrado para actualizar", status: 404 });
                }
                this.getById(id_usuario).then(resolve).catch(reject);
            });
        });
    }

    async delete(id_usuario) {
        const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [id_usuario], (err, result) => {
                if (err) {
                    return reject({ error: "Error al eliminar el usuario", details: err });
                }
                if (result.affectedRows === 0) {
                    return reject({ error: "Usuario no encontrado para eliminar", status: 404 });
                }
                resolve({ message: "Usuario eliminado", id: id_usuario });
            });
        });
    }

    async login(email, password) {
        const sql = `SELECT * FROM usuarios WHERE email = ? AND password = ?`;
        return new Promise((resolve, reject) => {
            db.query(sql, [email, password], (err, result) => {
                if (err) {
                    return reject({ error: "Error interno", details: err });
                }
                if (result.length === 0) {
                    return reject({ error: "Credenciales incorrectas", status: 401 });
                }
        
                const user = result[0];
                resolve(user);
            });
        });
    }
}

module.exports = new UsuarioService();
