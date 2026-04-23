/* ============================================
   PORCIÓN DE CIELO — app.js
   Vanilla JS · CRUD completo · API REST
   ============================================ */

const API = '/api/recetas';

// ---- Estado ----
let recetas = [];
let recetaAEliminar = null;
let modoEdicion = false;

// ---- Caché de elementos DOM ----
const $ = id => document.getElementById(id);

const dom = {
  grid: $('recetasGrid'),
  empty: $('emptyState'),
  totalRecetas: $('totalRecetas'),
  recetasFiltradas: $('recetasFiltradas'),
  promedioCalif: $('promedioCalif'),
  buscador: $('buscador'),
  filtroCategoria: $('filtroCategoria'),
  filtroDificultad: $('filtroDificultad'),
  modalDetalle: $('modalDetalle'),
  modalForm: $('modalFormulario'),
  modalConfirm: $('modalConfirmar'),
  detalleContent: $('detalleContent'),
  form: $('recetaForm'),
  toast: $('toast'),
  toastMsg: $('toastMsg'),
  toastIcon: $('toastIcon'),
  // Form fields
  recetaId: $('recetaId'),
  nombre: $('nombre'),
  descripcion: $('descripcion'),
  categoria: $('categoria'),
  dificultad: $('dificultad'),
  tiempoPreparacion: $('tiempoPreparacion'),
  tiempoHorneado: $('tiempoHorneado'),
  porciones: $('porciones'),
  calificacion: $('calificacion'),
  imagen: $('imagen'),
  ingredientesContainer: $('ingredientesContainer'),
  pasosContainer: $('pasosContainer'),
};

// ==========================================
// API CALLS
// ==========================================

async function fetchRecetas() {
  const categoria = dom.filtroCategoria.value;
  const dificultad = dom.filtroDificultad.value;
  const buscar = dom.buscador.value.trim();

  const params = new URLSearchParams();
  if (categoria !== 'todas') params.append('categoria', categoria);
  if (dificultad !== 'todas') params.append('dificultad', dificultad);
  if (buscar) params.append('buscar', buscar);

  try {
    const res = await fetch(`${API}?${params}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    recetas = data.data;
    actualizarStats(data.stats);
    renderGrid(recetas);
  } catch (err) {
    showToast('Error al cargar recetas: ' + err.message, 'error');
  }
}

async function fetchRecetaById(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

async function crearReceta(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function actualizarReceta(id, payload) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function eliminarReceta(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return await res.json();
}

// ==========================================
// RENDER
// ==========================================

function renderGrid(lista) {
  dom.grid.innerHTML = '';

  if (lista.length === 0) {
    dom.empty.style.display = 'block';
    return;
  }

  dom.empty.style.display = 'none';
  lista.forEach((r, i) => {
    const card = crearCard(r);
    card.style.animationDelay = `${i * 0.05}s`;
    dom.grid.appendChild(card);
  });
}

function crearCard(r) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = r._id;

  const imgHtml = r.imagen
    ? `<img src="${r.imagen}" alt="${r.nombre}" class="card__img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = r.imagen ? 'display:none' : '';

  card.innerHTML = `
    ${imgHtml}
    <div class="card__img-placeholder" style="${placeholderStyle}">${categoriaEmoji(r.categoria)}</div>
    <div class="card__body">
      <div class="card__meta">
        <span class="badge badge--categoria">${capitalizar(r.categoria)}</span>
        <span class="badge badge--${r.dificultad}">${capitalizar(r.dificultad)}</span>
      </div>
      <h3 class="card__title">${r.nombre}</h3>
      <p class="card__desc">${r.descripcion}</p>
      <div class="card__info">
        <div class="card__info-item">
          <span class="card__info-value">${r.tiempoPreparacion}</span>
          <span class="card__info-label">min prep</span>
        </div>
        ${r.tiempoHorneado ? `
        <div class="card__info-item">
          <span class="card__info-value">${r.tiempoHorneado}</span>
          <span class="card__info-label">min horno</span>
        </div>` : ''}
        <div class="card__info-item">
          <span class="card__info-value">${r.porciones}</span>
          <span class="card__info-label">porciones</span>
        </div>
        <div class="card__info-item">
          <span class="card__info-value">${r.ingredientes.length}</span>
          <span class="card__info-label">ingredientes</span>
        </div>
      </div>
      <div class="card__stars">${renderStars(r.calificacion)}</div>
      <div class="card__actions">
        <button class="card__btn card__btn--view" data-id="${r._id}" data-action="ver">Ver</button>
        <button class="card__btn card__btn--edit" data-id="${r._id}" data-action="editar">Editar</button>
        <button class="card__btn card__btn--delete" data-id="${r._id}" data-action="eliminar">Eliminar</button>
      </div>
    </div>
  `;
  return card;
}

function renderDetalle(r) {
  const imgHtml = r.imagen
    ? `<img src="${r.imagen}" alt="${r.nombre}" class="detalle__img" onerror="this.style.display='none'">`
    : `<div class="detalle__img-placeholder">${categoriaEmoji(r.categoria)}</div>`;

  const ingredientesHtml = r.ingredientes.map(ing => `
    <li>
      <span class="ingrediente-cantidad">${ing.cantidad}</span>
      &nbsp;${ing.nombre}
    </li>
  `).join('');

  const pasosHtml = r.pasos
    .sort((a, b) => a.orden - b.orden)
    .map(p => `
      <li class="paso-item">
        <span class="paso-num">${p.orden}</span>
        <span class="paso-text">${p.descripcion}</span>
      </li>
    `).join('');

  dom.detalleContent.innerHTML = `
    ${imgHtml}
    <div class="detalle__body">
      <div class="detalle__meta">
        <span class="badge badge--categoria">${capitalizar(r.categoria)}</span>
        <span class="badge badge--${r.dificultad}">${capitalizar(r.dificultad)}</span>
      </div>
      <h2 class="detalle__title">${r.nombre}</h2>
      <p class="detalle__desc">${r.descripcion}</p>
      <div class="detalle__stats">
        <div class="detalle__stat">
          <span class="detalle__stat-value">${r.tiempoPreparacion} min</span>
          <span class="detalle__stat-label">Preparación</span>
        </div>
        <div class="detalle__stat">
          <span class="detalle__stat-value">${r.tiempoHorneado || 0} min</span>
          <span class="detalle__stat-label">Horneado</span>
        </div>
        <div class="detalle__stat">
          <span class="detalle__stat-value">${r.porciones}</span>
          <span class="detalle__stat-label">Porciones</span>
        </div>
        <div class="detalle__stat">
          <span class="detalle__stat-value">${r.calificacion || 0} ★</span>
          <span class="detalle__stat-label">Calificación</span>
        </div>
      </div>
      <h3 class="detalle__section-title">Ingredientes</h3>
      <ul class="ingredientes-list">${ingredientesHtml}</ul>
      <h3 class="detalle__section-title">Preparación</h3>
      <ol class="pasos-list">${pasosHtml}</ol>
    </div>
  `;
}

// ==========================================
// STATS
// ==========================================

function actualizarStats(stats) {
  animarNumero(dom.totalRecetas, parseInt(dom.totalRecetas.textContent), stats.total);
  animarNumero(dom.recetasFiltradas, parseInt(dom.recetasFiltradas.textContent), stats.filtradas);
  dom.promedioCalif.textContent = stats.promedioCalificacion;
}

function animarNumero(el, desde, hasta) {
  const duracion = 500;
  const inicio = performance.now();
  const animar = (ahora) => {
    const t = Math.min((ahora - inicio) / duracion, 1);
    el.textContent = Math.round(desde + (hasta - desde) * t);
    if (t < 1) requestAnimationFrame(animar);
  };
  requestAnimationFrame(animar);
}

// ==========================================
// FORMULARIO — INGREDIENTES Y PASOS
// ==========================================

let contIngredientes = 0;
let contPasos = 0;

function agregarIngrediente(nombre = '', cantidad = '') {
  contIngredientes++;
  const row = document.createElement('div');
  row.className = 'ingrediente-row';
  row.innerHTML = `
    <input type="text" class="form-input ing-nombre" placeholder="Nombre del ingrediente" value="${nombre}" required>
    <input type="text" class="form-input ing-cantidad" placeholder="Cantidad (ej: 200g)" value="${cantidad}" required>
    <button type="button" class="btn-remove" title="Eliminar">×</button>
  `;
  row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
  dom.ingredientesContainer.appendChild(row);
}

function agregarPaso(descripcion = '') {
  contPasos++;
  const n = dom.pasosContainer.children.length + 1;
  const row = document.createElement('div');
  row.className = 'paso-row';
  row.innerHTML = `
    <span class="paso-num-label">${n}</span>
    <textarea class="form-input paso-desc" placeholder="Describe este paso..." required>${descripcion}</textarea>
    <button type="button" class="btn-remove" title="Eliminar">×</button>
  `;
  row.querySelector('.btn-remove').addEventListener('click', () => {
    row.remove();
    renumerarPasos();
  });
  dom.pasosContainer.appendChild(row);
}

function renumerarPasos() {
  dom.pasosContainer.querySelectorAll('.paso-num-label').forEach((el, i) => {
    el.textContent = i + 1;
  });
}

function leerIngredientes() {
  const rows = dom.ingredientesContainer.querySelectorAll('.ingrediente-row');
  return Array.from(rows).map(row => ({
    nombre: row.querySelector('.ing-nombre').value.trim(),
    cantidad: row.querySelector('.ing-cantidad').value.trim()
  })).filter(i => i.nombre && i.cantidad);
}

function leerPasos() {
  const rows = dom.pasosContainer.querySelectorAll('.paso-row');
  return Array.from(rows).map((row, i) => ({
    orden: i + 1,
    descripcion: row.querySelector('.paso-desc').value.trim()
  })).filter(p => p.descripcion.length >= 5);
}

// ==========================================
// VALIDACIÓN
// ==========================================

function validarFormulario() {
  let valido = true;
  limpiarErrores();

  const campos = [
    { id: 'nombre', err: 'errorNombre', min: 3, msg: 'Mínimo 3 caracteres' },
    { id: 'descripcion', err: 'errorDescripcion', min: 10, msg: 'Mínimo 10 caracteres' },
    { id: 'categoria', err: 'errorCategoria', msg: 'Selecciona una categoría' },
    { id: 'dificultad', err: 'errorDificultad', msg: 'Selecciona la dificultad' },
    { id: 'tiempoPreparacion', err: 'errorTiempoPreparacion', msg: 'Ingresa el tiempo de preparación', num: true, min: 1 },
    { id: 'porciones', err: 'errorPorciones', msg: 'Ingresa las porciones', num: true, min: 1 },
  ];

  campos.forEach(c => {
    const el = $(c.id);
    const val = el.value.trim();

    if (!val) {
      mostrarError(c.err, c.msg || 'Campo requerido');
      el.classList.add('error');
      valido = false;
    } else if (c.min && !c.num && val.length < c.min) {
      mostrarError(c.err, c.msg);
      el.classList.add('error');
      valido = false;
    } else if (c.num && (isNaN(val) || Number(val) < c.min)) {
      mostrarError(c.err, c.msg);
      el.classList.add('error');
      valido = false;
    }
  });

  const ings = leerIngredientes();
  if (ings.length === 0) {
    mostrarError('errorIngredientes', 'Agrega al menos un ingrediente completo');
    valido = false;
  }

  const pasos = leerPasos();
  if (pasos.length === 0) {
    mostrarError('errorPasos', 'Agrega al menos un paso (mínimo 5 caracteres)');
    valido = false;
  }

  return valido;
}

function mostrarError(id, msg) { const el = $(id); if (el) el.textContent = msg; }

function limpiarErrores() {
  ['errorNombre','errorDescripcion','errorCategoria','errorDificultad',
   'errorTiempoPreparacion','errorPorciones','errorIngredientes','errorPasos']
    .forEach(id => { const el = $(id); if (el) el.textContent = ''; });

  dom.form.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
}

// ==========================================
// MODALES
// ==========================================

function abrirModal(id) {
  $(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModal(id) {
  $(id).classList.remove('active');
  document.body.style.overflow = '';
}

function abrirFormNuevo() {
  modoEdicion = false;
  dom.recetaId.value = '';
  dom.form.reset();
  dom.ingredientesContainer.innerHTML = '';
  dom.pasosContainer.innerHTML = '';
  limpiarErrores();
  $('formTitulo').textContent = 'Nueva Receta';
  $('btnSubmitForm').textContent = 'Guardar Receta';
  agregarIngrediente();
  agregarPaso();
  abrirModal('modalFormulario');
}

async function abrirFormEditar(id) {
  try {
    const r = await fetchRecetaById(id);
    modoEdicion = true;
    dom.recetaId.value = r._id;
    dom.nombre.value = r.nombre;
    dom.descripcion.value = r.descripcion;
    dom.categoria.value = r.categoria;
    dom.dificultad.value = r.dificultad;
    dom.tiempoPreparacion.value = r.tiempoPreparacion;
    dom.tiempoHorneado.value = r.tiempoHorneado || 0;
    dom.porciones.value = r.porciones;
    dom.calificacion.value = r.calificacion || 0;
    dom.imagen.value = r.imagen || '';
    limpiarErrores();

    dom.ingredientesContainer.innerHTML = '';
    r.ingredientes.forEach(i => agregarIngrediente(i.nombre, i.cantidad));

    dom.pasosContainer.innerHTML = '';
    r.pasos.sort((a, b) => a.orden - b.orden).forEach(p => agregarPaso(p.descripcion));

    $('formTitulo').textContent = 'Editar Receta';
    $('btnSubmitForm').textContent = 'Actualizar Receta';
    abrirModal('modalFormulario');
  } catch (err) {
    showToast('No se pudo cargar la receta: ' + err.message, 'error');
  }
}

async function abrirDetalle(id) {
  try {
    const r = await fetchRecetaById(id);
    renderDetalle(r);
    abrirModal('modalDetalle');
  } catch (err) {
    showToast('No se pudo cargar el detalle', 'error');
  }
}

// ==========================================
// TOAST
// ==========================================

let toastTimeout;
function showToast(msg, tipo = 'success') {
  clearTimeout(toastTimeout);
  dom.toastMsg.textContent = msg;
  dom.toast.className = `toast toast--${tipo}`;
  dom.toastIcon.textContent = tipo === 'success' ? '✓' : '✕';
  dom.toast.classList.add('show');
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), 3500);
}

// ==========================================
// HELPERS
// ==========================================

function capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function renderStars(cal) {
  const n = Math.round(cal);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function categoriaEmoji(cat) {
  const map = {
    tortas: '🎂', galletas: '🍪', pasteles: '🥐',
    postres: '🍮', panes: '🍞', helados: '🍦', otros: '🍩'
  };
  return map[cat] || '✦';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Botones abrir formulario
$('btnNuevaReceta').addEventListener('click', abrirFormNuevo);
$('btnNuevaReceta') && $('btnAbrirFormNav') && $('btnAbrirFormNav').addEventListener('click', abrirFormNuevo);
$('btnEmptyCta').addEventListener('click', abrirFormNuevo);
$('btnHeroCta').addEventListener('click', () => document.getElementById('recetas').scrollIntoView({ behavior: 'smooth' }));

// Cerrar modales
$('cerrarDetalle').addEventListener('click', () => cerrarModal('modalDetalle'));
$('cerrarFormulario').addEventListener('click', () => cerrarModal('modalFormulario'));
$('btnCancelarForm').addEventListener('click', () => cerrarModal('modalFormulario'));
$('btnCancelarEliminar').addEventListener('click', () => cerrarModal('modalConfirmar'));

// Cerrar al hacer clic en overlay
['modalDetalle', 'modalFormulario', 'modalConfirmar'].forEach(id => {
  $(id).addEventListener('click', e => {
    if (e.target === $(id)) cerrarModal(id);
  });
});

// Acciones en cards (delegación de eventos)
dom.grid.addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { id, action } = btn.dataset;
  if (action === 'ver') abrirDetalle(id);
  if (action === 'editar') abrirFormEditar(id);
  if (action === 'eliminar') {
    recetaAEliminar = id;
    abrirModal('modalConfirmar');
  }
});

// Click en título de card
dom.grid.addEventListener('click', e => {
  const titulo = e.target.closest('.card__title');
  if (!titulo) return;
  const card = titulo.closest('.card');
  if (card) abrirDetalle(card.dataset.id);
});

// Agregar ingrediente / paso
$('btnAgregarIngrediente').addEventListener('click', () => agregarIngrediente());
$('btnAgregarPaso').addEventListener('click', () => agregarPaso());

// Confirmar eliminar
$('btnConfirmarEliminar').addEventListener('click', async () => {
  if (!recetaAEliminar) return;
  const btn = $('btnConfirmarEliminar');
  btn.textContent = 'Eliminando...';
  btn.disabled = true;

  const data = await eliminarReceta(recetaAEliminar);
  btn.textContent = 'Sí, eliminar';
  btn.disabled = false;

  if (data.success) {
    cerrarModal('modalConfirmar');
    showToast('¡Receta eliminada!', 'success');
    await fetchRecetas();
  } else {
    showToast(data.message, 'error');
  }

  recetaAEliminar = null;
});

// Submit formulario
dom.form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!validarFormulario()) return;

  const ingredientes = leerIngredientes();
  const pasos = leerPasos();

  const payload = {
    nombre: dom.nombre.value.trim(),
    descripcion: dom.descripcion.value.trim(),
    categoria: dom.categoria.value,
    dificultad: dom.dificultad.value,
    tiempoPreparacion: Number(dom.tiempoPreparacion.value),
    tiempoHorneado: Number(dom.tiempoHorneado.value) || 0,
    porciones: Number(dom.porciones.value),
    calificacion: Number(dom.calificacion.value) || 0,
    imagen: dom.imagen.value.trim(),
    ingredientes,
    pasos
  };

  const btn = $('btnSubmitForm');
  btn.textContent = 'Guardando...';
  btn.disabled = true;

  let data;
  if (modoEdicion) {
    data = await actualizarReceta(dom.recetaId.value, payload);
  } else {
    data = await crearReceta(payload);
  }

  btn.textContent = modoEdicion ? 'Actualizar Receta' : 'Guardar Receta';
  btn.disabled = false;

  if (data.success) {
    cerrarModal('modalFormulario');
    showToast(data.message, 'success');
    await fetchRecetas();
  } else {
    showToast(data.message, 'error');
  }
});

// Filtros en tiempo real
let filterTimeout;
const filtrar = () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(fetchRecetas, 350);
};

dom.buscador.addEventListener('input', filtrar);
dom.filtroCategoria.addEventListener('change', fetchRecetas);
dom.filtroDificultad.addEventListener('change', fetchRecetas);

// ==========================================
// INIT
// ==========================================
fetchRecetas();
