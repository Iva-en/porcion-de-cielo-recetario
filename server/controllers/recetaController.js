const Receta = require('../models/Receta');

// GET all recetas (con filtros)
exports.getRecetas = async (req, res) => {
  try {
    const { categoria, dificultad, buscar } = req.query;
    let filtro = {};

    if (categoria && categoria !== 'todas') filtro.categoria = categoria;
    if (dificultad && dificultad !== 'todas') filtro.dificultad = dificultad;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } }
      ];
    }

    const recetas = await Receta.find(filtro).sort({ createdAt: -1 });

    // Stats
    const total = await Receta.countDocuments();
    const promedioCalificacion = await Receta.aggregate([
      { $group: { _id: null, promedio: { $avg: '$calificacion' } } }
    ]);

    res.json({
      success: true,
      data: recetas,
      stats: {
        total,
        filtradas: recetas.length,
        promedioCalificacion: promedioCalificacion[0]?.promedio?.toFixed(1) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET receta por ID
exports.getRecetaById = async (req, res) => {
  try {
    const receta = await Receta.findById(req.params.id);
    if (!receta) return res.status(404).json({ success: false, message: 'Receta no encontrada' });
    res.json({ success: true, data: receta });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST crear receta
exports.crearReceta = async (req, res) => {
  try {
    const receta = new Receta(req.body);
    await receta.save();
    res.status(201).json({ success: true, data: receta, message: '¡Receta creada exitosamente!' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: mensajes.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT actualizar receta
exports.actualizarReceta = async (req, res) => {
  try {
    const receta = await Receta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!receta) return res.status(404).json({ success: false, message: 'Receta no encontrada' });
    res.json({ success: true, data: receta, message: '¡Receta actualizada exitosamente!' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: mensajes.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE eliminar receta
exports.eliminarReceta = async (req, res) => {
  try {
    const receta = await Receta.findByIdAndDelete(req.params.id);
    if (!receta) return res.status(404).json({ success: false, message: 'Receta no encontrada' });
    res.json({ success: true, message: '¡Receta eliminada exitosamente!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
