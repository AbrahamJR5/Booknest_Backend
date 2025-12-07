const express = require("express");
const router = express.Router();
const CategoriaService = require("../services/categoryService");

router.get("/", async (req, res) => {
    try {
        const categorias = await CategoriaService.getAll();
        res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener las categorías",
            details: error.error
        });
    }
});

router.get("/:id_categoria", async (req, res) => {
    try {
        const { id_categoria } = req.params;
        const categoria = await CategoriaService.getById(id_categoria);
        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al obtener la categoría",
            details: error.error
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const categoriaCreada = await CategoriaService.create(req.body);
        res.status(201).json(categoriaCreada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al crear la categoría",
            details: error.error
        });
    }
});

router.put("/:id_categoria", async (req, res) => {
    try {
        const { id_categoria } = req.params;
        const categoriaActualizada = await CategoriaService.update(id_categoria, req.body);
        res.status(200).json(categoriaActualizada);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al actualizar la categoría",
            details: error.error
        });
    }
});

router.delete("/:id_categoria", async (req, res) => {
    try {
        const { id_categoria } = req.params;
        const resultado = await CategoriaService.delete(id_categoria);
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al eliminar la categoría",
            details: error.error
        });
    }
});

module.exports = router;