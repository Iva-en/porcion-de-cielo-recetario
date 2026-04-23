const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  cantidad: { type: String, required: true, trim: true }
});

const pasoSchema = new mongoose.Schema({
  orden: { type: Number, required: true },
  descripcion: { type: String, required: true, trim: true, minlength: 5 }
});

const recetaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['tortas', 'galletas', 'pasteles', 'postres', 'panes', 'helados', 'otros']
  },
  dificultad: {
    type: String,
    required: true,
    enum: ['facil', 'medio', 'dificil']
  },
  tiempoPreparacion: {
    type: Number,
    required: [true, 'El tiempo de preparación es obligatorio'],
    min: [1, 'El tiempo mínimo es 1 minuto']
  },
  tiempoHorneado: {
    type: Number,
    default: 0
  },
  porciones: {
    type: Number,
    required: [true, 'Las porciones son obligatorias'],
    min: [1, 'Mínimo 1 porción']
  },
  ingredientes: {
    type: [ingredienteSchema],
    validate: {
      validator: v => v.length >= 1,
      message: 'Debe haber al menos un ingrediente'
    }
  },
  pasos: {
    type: [pasoSchema],
    validate: {
      validator: v => v.length >= 1,
      message: 'Debe haber al menos un paso'
    }
  },
  imagen: {
    type: String,
    default: ''
  },
  calificacion: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receta', recetaSchema);
