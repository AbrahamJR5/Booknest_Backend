const express = require("express");
const router = express.Router();
const UsuarioService = require("../services/userService");

router.get("/", async (req, res) => {
    try {
        const usuarios = await UsuarioService.getAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener los usuarios",
            details: error.error
        });
    }
});

router.get("/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const usuario = await UsuarioService.getById(id_usuario);
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al obtener el usuario",
            details: error.error
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const usuarioCreado = await UsuarioService.create(req.body);
        res.status(201).json(usuarioCreado);
    } catch (error) {
        console.error(error);
        if (error.status === 400) { // Para ER_DUP_ENTRY
            return res.status(400).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al crear el usuario",
            details: error.error
        });
    }
});



router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ mensaje: "Email y contraseña son requeridos" });
        }

        const usuario = await UsuarioService.login(email, password); 
        res.status(200).json({
            mensaje: "Login exitoso",
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                tipo: usuario.tipo 
            }
        });
        
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        res.status(status).json({ mensaje: error.error || "Error al iniciar sesión" });
    }
});

router.put("/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const usuarioActualizado = await UsuarioService.update(id_usuario, req.body);
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        if (error.status === 400) { // Para ER_DUP_ENTRY
            return res.status(400).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al actualizar el usuario",
            details: error.error
        });
    }
});

router.delete("/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const resultado = await UsuarioService.delete(id_usuario);
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al eliminar el usuario",
            details: error.error
        });
    }
});

module.exports = router;