const express = require("express");
const router = express.Router();
const BookService = require("../services/bookService");
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');
const upload = require('../config/multerConfig'); 

router.get("/", async (req, res) => {
    try {
        const libros = await BookService.getAll();
        res.status(200).json(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener el catálogo de libros",
            details: error.error
        });
    }
});

router.get("/:id_libro", async (req, res) => {
    try {
        const {id_libro} = req.params;
        const libro = await BookService.getById(id_libro);
        if (libro) {
            res.status(200).json(libro);
        } else {
            res.status(404).json({ mensaje: "Libro no encontrado" });
        }
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al obtener el libro",
            details: error.details || error.error || "Error interno del servidor"
        });
    }
});

router.post("/", upload.single('imagen'), async (req, res) => {
    try {
        console.log(req.file); 
        console.log(req.body); 
        const data = req.body;
        if (req.file) {
            data.imagen = req.file.filename; 
        }

        const libroCreado = await BookService.create(data);
        res.status(201).json(libroCreado);
    } catch (error) {
        // ... manejo de errores
    }
});

router.put("/:id_libro", async (req, res) => {
    try {
        const { id_libro } = req.params;
        const libroActualizado = await BookService.update(id_libro, req.body);
        res.status(200).json(libroActualizado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            details: error.error
        });
    }
});

router.delete("/:id_libro", async (req, res) => {
    try {
        const { id_libro } = req.params;
        const resultado = await BookService.delete(id_libro);
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al eliminar el libro",
            details: error.error
        });
    }
});


module.exports = router;