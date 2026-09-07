// Lista de categorías disponibles: nombre, símbolo (emoji) y color
const categorias = [
  { nombre: 'Personal', simbolo: '🧠', color: '#a29bfe' },
  { nombre: 'Familia',  simbolo: '🏠', color: '#74b9ff' },
  { nombre: 'Amigos',   simbolo: '👥', color: '#55efc4' },
  { nombre: 'Escuela',  simbolo: '📚', color: '#ffeaa7' },
  { nombre: 'Emociones',simbolo: '💭', color: '#fab1a0' },
];

const form = document.getElementById('form-nota');
const input = document.getElementById('input-nota');
const selectCategoria = document.getElementById('select-categoria');
const lista = document.getElementById('lista-notas');

const notasVisibles = new Set();
// Guarda qué nota está actualmente en modo edición (índice), o null si ninguna
let notaEditando = null;

function cargarCategoriasEnSelect(selectElemento) {
  selectElemento.innerHTML = '';
  categorias.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.nombre;
    option.textContent = `${cat.simbolo} ${cat.nombre}`;
    selectElemento.appendChild(option);
  });
}

function obtenerNotas() {
  return JSON.parse(localStorage.getItem('notas')) || [];
}

function guardarNotas(notas) {
  localStorage.setItem('notas', JSON.stringify(notas));
}

function tiempoRestanteTexto(ms) {
  const minutos = Math.ceil(ms / 60000);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.ceil(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.ceil(horas / 24);
  return `${dias} d`;
}

function cargarNotas() {
  const notas = obtenerNotas();
  lista.innerHTML = '';
  const ahora = Date.now();

  notas.forEach((nota, index) => {
    const cat = categorias.find(c => c.nombre === nota.categoria) || categorias[0];

    const li = document.createElement('li');
    li.style.borderLeft = `6px solid ${cat.color}`;

    // --- MODO EDICIÓN ---
    if (notaEditando === index) {
      const selectEdit = document.createElement('select');
      cargarCategoriasEnSelect(selectEdit);
      selectEdit.value = nota.categoria;

      const textareaEdit = document.createElement('textarea');
      textareaEdit.value = nota.texto;
      textareaEdit.rows = 3;
      textareaEdit.className = 'textarea-edit';

      const grupoBotonesEdit = document.createElement('div');
      grupoBotonesEdit.className = 'grupo-botones';

      const botonGuardar = document.createElement('button');
      botonGuardar.type = 'button';
      botonGuardar.className = 'boton-icono';
      botonGuardar.textContent = '✅ Guardar';
      botonGuardar.addEventListener('click', () => {
        const nuevoTexto = textareaEdit.value.trim();
        if (nuevoTexto === '') return;
        const notasActuales = obtenerNotas();
        notasActuales[index].texto = nuevoTexto;
        notasActuales[index].categoria = selectEdit.value;
        guardarNotas(notasActuales);
        notaEditando = null;
        cargarNotas();
      });

      const botonCancelar = document.createElement('button');
      botonCancelar.type = 'button';
      botonCancelar.className = 'boton-icono';
      botonCancelar.textContent = '✖️ Cancelar';
      botonCancelar.addEventListener('click', () => {
        notaEditando = null;
        cargarNotas();
      });

      grupoBotonesEdit.appendChild(botonGuardar);
      grupoBotonesEdit.appendChild(botonCancelar);

      li.appendChild(selectEdit);
      li.appendChild(textareaEdit);
      li.appendChild(grupoBotonesEdit);
      lista.appendChild(li);
      return; // no seguir con el modo normal para esta nota
    }

    // --- MODO NORMAL ---
    const fila = document.createElement('div');
    fila.className = 'fila-nota';

    const badge = document.createElement('span');
    badge.className = 'badge-categoria';
    badge.style.backgroundColor = cat.color;
    badge.textContent = `${cat.simbolo} ${cat.nombre}`;

    const botonCandado = document.createElement('button');
    botonCandado.type = 'button';
    botonCandado.className = 'boton-icono';

    const botonTemporizador = document.createElement('button');
    botonTemporizador.type = 'button';
    botonTemporizador.className = 'boton-icono';

    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.className = 'boton-icono';
    botonEditar.textContent = '✏️';
    botonEditar.title = 'Editar nota';

    const botonBorrar = document.createElement('button');
    botonBorrar.type = 'button';
    botonBorrar.className = 'boton-icono';
    botonBorrar.textContent = '🗑️';
    botonBorrar.title = 'Borrar nota';

    const grupoBotones = document.createElement('div');
    grupoBotones.className = 'grupo-botones';
    grupoBotones.appendChild(botonTemporizador);
    grupoBotones.appendChild(botonCandado);
    grupoBotones.appendChild(botonEditar);
    grupoBotones.appendChild(botonBorrar);

    fila.appendChild(badge);
    fila.appendChild(grupoBotones);

    const texto = document.createElement('p');

    const temporizadorCumplido = nota.ocultarEn && ahora >= nota.ocultarEn;
    const bloqueada = nota.bloqueada;
    const debeOcultarse = (bloqueada || temporizadorCumplido) && !notasVisibles.has(index);

    if (debeOcultarse) {
      botonCandado.textContent = bloqueada ? '🔒' : '👁️';
      texto.textContent = bloqueada
        ? 'Nota privada. Haz clic en el candado para verla.'
        : 'Nota oculta por temporizador. Haz clic en el ojo para verla.';
      texto.classList.add('texto-oculto');
      // Por seguridad, no permitir editar/borrar sin desbloquear primero
      botonEditar.disabled = true;
      botonBorrar.disabled = true;
    } else {
      botonCandado.textContent = bloqueada ? '🔓' : '➕🔒';
      texto.textContent = nota.texto;
      texto.classList.remove('texto-oculto');
    }

    if (!nota.ocultarEn) {
      botonTemporizador.textContent = '⏱️';
      botonTemporizador.title = 'Programar ocultamiento automático';
    } else if (!temporizadorCumplido) {
      const restante = nota.ocultarEn - ahora;
      botonTemporizador.textContent = `⏳ ${tiempoRestanteTexto(restante)}`;
      botonTemporizador.title = 'Tiempo restante para ocultarse';
    } else {
      botonTemporizador.textContent = notasVisibles.has(index) ? '👁️' : '👁️‍🗨️';
      botonTemporizador.title = 'Ya se ocultó automáticamente';
    }

    botonCandado.addEventListener('click', () => manejarCandado(index));
    botonTemporizador.addEventListener('click', () => manejarTemporizador(index));
    botonEditar.addEventListener('click', () => manejarEditar(index));
    botonBorrar.addEventListener('click', () => manejarBorrar(index));

    li.appendChild(fila);
    li.appendChild(texto);
    lista.appendChild(li);
  });
}

function manejarEditar(index) {
  notaEditando = index;
  cargarNotas();
}

function manejarBorrar(index) {
  const confirmar = confirm('¿Seguro que quieres borrar esta nota? No se puede deshacer.');
  if (!confirmar) return;

  const notas = obtenerNotas();
  notas.splice(index, 1); // elimina la nota en esa posición
  guardarNotas(notas);
  notasVisibles.clear(); // reiniciamos, ya que los índices cambiaron
  cargarNotas();
}

function manejarCandado(index) {
  const notas = obtenerNotas();
  const nota = notas[index];

  if (!nota.bloqueada) {
    const pin = prompt('Crea un PIN para proteger esta nota:');
    if (!pin) return;
    nota.bloqueada = true;
    nota.pin = pin;
    guardarNotas(notas);
    notasVisibles.delete(index);
    cargarNotas();
    return;
  }

  if (notasVisibles.has(index)) {
    notasVisibles.delete(index);
    cargarNotas();
    return;
  }

  const intento = prompt('Ingresa el PIN para ver esta nota:');
  if (intento === null) return;
  if (intento === nota.pin) {
    notasVisibles.add(index);
    cargarNotas();
  } else {
    alert('PIN incorrecto.');
  }
}

function manejarTemporizador(index) {
  const notas = obtenerNotas();
  const nota = notas[index];
  const ahora = Date.now();

  const temporizadorCumplido = nota.ocultarEn && ahora >= nota.ocultarEn;

  if (!nota.ocultarEn) {
    const minutosTexto = prompt(
      '¿En cuántos minutos quieres que esta nota se oculte sola?\n(Ejemplos: 1 = un minuto, 60 = una hora, 1440 = un día)'
    );
    const minutos = parseFloat(minutosTexto);
    if (!minutosTexto || isNaN(minutos) || minutos <= 0) return;

    nota.ocultarEn = ahora + minutos * 60000;
    guardarNotas(notas);
    cargarNotas();
    return;
  }

  if (temporizadorCumplido) {
    if (notasVisibles.has(index)) {
      notasVisibles.delete(index);
    } else {
      notasVisibles.add(index);
    }
    cargarNotas();
    return;
  }

  alert('El temporizador ya está activo. Espera a que se cumpla el tiempo.');
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const texto = input.value.trim();
  if (texto === '') return;

  const nuevaNota = {
    texto: texto,
    categoria: selectCategoria.value,
    fecha: new Date().toISOString(),
    bloqueada: false,
    pin: null,
    ocultarEn: null
  };

  const notas = obtenerNotas();
  notas.push(nuevaNota);
  guardarNotas(notas);

  input.value = '';
  cargarNotas();
});

cargarCategoriasEnSelect(selectCategoria);
cargarNotas();

setInterval(() => {
  // No refrescar automáticamente si hay una nota en modo edición,
  // para no perder lo que el usuario está escribiendo
  if (notaEditando === null) {
    cargarNotas();
  }
}, 10000);