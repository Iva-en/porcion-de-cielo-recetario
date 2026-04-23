const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recetaController');

router.get('/', ctrl.getRecetas);
router.get('/:id', ctrl.getRecetaById);
router.post('/', ctrl.crearReceta);
router.put('/:id', ctrl.actualizarReceta);
router.delete('/:id', ctrl.eliminarReceta);

module.exports = router;
