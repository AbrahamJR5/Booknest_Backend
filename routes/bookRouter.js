const express = require("express");
const router = express.Router();
const BookService = require("../services/bookService");

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
        res.status(500).json({
            mensaje: "Error al obtener el libro",
            details: error.error
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const libroCreado = await BookService.create(req.body);
        res.status(201).json(libroCreado);
    } catch (error) {       
        console.error(error);
        res.status(500).json({
            mensaje: "Error al crear el libro",
            details: error.error
        }); 
    }
})


module.exports = router;