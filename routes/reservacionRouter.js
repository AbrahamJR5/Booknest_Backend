const express = require("express");
const router = express.Router();
const ReservacionService = require("../services/reservacionService");

router.get("/", async (req, res) => {
    try {
        const reservaciones = await ReservacionService.getAll();
        res.status(200).json(reservaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener las reservaciones",
            details: error.error
        });
    }
});

router.get("/:id_reservacion", async (req, res) => {
    try {
        const { id_reservacion } = req.params;
        const reservacion = await ReservacionService.getById(id_reservacion);
        res.status(200).json(reservacion);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al obtener la reservación",
            details: error.error
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const reservacionCreada = await ReservacionService.create(req.body);
        res.status(201).json(reservacionCreada);
    } catch (error) {
        console.error(error);
        if (error.status === 400) { // Por ejemplo, si no hay stock
            return res.status(400).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al crear la reservación",
            details: error.error || "Error interno del servidor"
        });
    }
});

router.put("/:id_reservacion", async (req, res) => {
    try {
        const { id_reservacion } = req.params;
        const reservacionActualizada = await ReservacionService.update(id_reservacion, req.body);
        res.status(200).json(reservacionActualizada);
    } catch (error) {
        console.error(error);
        if (error.status === 404 || error.status === 400) {
            return res.status(error.status).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al actualizar la reservación",
            details: error.error || "Error interno del servidor"
        });
    }
});

router.delete("/:id_reservacion", async (req, res) => {
    try {
        const { id_reservacion } = req.params;
        const resultado = await ReservacionService.delete(id_reservacion);
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            return res.status(404).json({ mensaje: error.error });
        }
        res.status(500).json({
            mensaje: "Error al eliminar la reservación",
            details: error.error || "Error interno del servidor"
        });
    }
});

module.exports = router;