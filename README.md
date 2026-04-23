# Porción de Cielo — Recetario de Repostería

Aplicación web de recetas de repostería con CRUD completo.

## Stack

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js + Express.js
- **Base de datos**: MongoDB + Mongoose
- **Variables de entorno**: dotenv

## Estructura del proyecto

```
porcion-de-cielo/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── server/
│   ├── index.js
│   ├── models/
│   │   └── Receta.js
│   ├── controllers/
│   │   └── recetaController.js
│   └── routes/
│       └── recetas.js
├── .env
├── .env.example
└── package.json
```

## Instalación

### 1. Clonar o descomprimir el proyecto

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz (o edita el existente):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/porcion-de-cielo
```

### 4. Asegurarte de tener MongoDB corriendo
```bash
# Si tienes MongoDB instalado localmente:
mongod

# O usa MongoDB Atlas y cambia MONGODB_URI en .env
```

### 5. Correr el servidor
```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

### 6. Abrir en el navegador
```
http://localhost:3000
```

## Funcionalidades

### CRUD Completo
- **Crear**: Formulario con validación de campos, ingredientes dinámicos y pasos numerados
- **Leer**: Grid de cards con detalle modal completo
- **Actualizar**: Formulario prellenado, cambios reflejados inmediatamente
- **Eliminar**: Confirmación modal antes de borrar

### Filtros en tiempo real
- Búsqueda por nombre o descripción
- Filtro por categoría (tortas, galletas, pasteles, etc.)
- Filtro por dificultad (fácil, medio, difícil)

### Indicadores visuales
- Total de recetas
- Cantidad de recetas filtradas
- Calificación promedio (se actualiza automáticamente)

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/recetas` | Obtener todas (con filtros opcionales) |
| GET | `/api/recetas/:id` | Obtener una por ID |
| POST | `/api/recetas` | Crear nueva |
| PUT | `/api/recetas/:id` | Actualizar |
| DELETE | `/api/recetas/:id` | Eliminar |

### Parámetros de query para GET /api/recetas
- `categoria`: tortas, galletas, pasteles, postres, panes, helados, otros
- `dificultad`: facil, medio, dificil
- `buscar`: texto libre (busca en nombre y descripción)
