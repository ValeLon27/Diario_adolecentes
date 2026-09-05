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

// Notas "reveladas" temporalmente en esta sesión (por PIN o por vistazo tras temporizador).
// Se reinicia siempre que recargas la página, por seguridad.
const notasVisibles = new Set();

function cargarCategoriasEnSelect() {
  selectCategoria.innerHTML = '';
  categorias.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.nombre;
    option.textContent = `${cat.simbolo} ${cat.nombre}`;
    selectCategoria.appendChild(option);
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

    const grupoBotones = document.createElement('div');
    grupoBotones.className = 'grupo-botones';
    grupoBotones.appendChild(botonTemporizador);
    grupoBotones.appendChild(botonCandado);

    fila.appendChild(badge);
    fila.appendChild(grupoBotones);

    const texto = document.createElement('p');

    // ¿Debe estar oculta por el temporizador?
    const temporizadorCumplido = nota.ocultarEn && ahora >= nota.ocultarEn;
    // ¿Debe estar oculta por el candado?
    const bloqueada = nota.bloqueada;

    const debeOcultarse = (bloqueada || temporizadorCumplido) && !notasVisibles.has(index);

    if (debeOcultarse) {
      botonCandado.textContent = bloqueada ? '🔒' : '👁️';
      texto.textContent = bloqueada
        ? 'Nota privada. Haz clic en el candado para verla.'
        : 'Nota oculta por temporizador. Haz clic en el ojo para verla.';
      texto.classList.add('texto-oculto');
    } else {
      botonCandado.textContent = bloqueada ? '🔓' : '➕🔒';
      texto.textContent = nota.texto;
      texto.classList.remove('texto-oculto');
    }

    // Configurar el botón de temporizador según su estado
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

    li.appendChild(fila);
    li.appendChild(texto);
    lista.appendChild(li);
  });
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
    // Aún no tiene temporizador: pedir duración
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
    // Ya se ocultó: el botón funciona como un "ojo" para ver/ocultar temporalmente
    if (notasVisibles.has(index)) {
      notasVisibles.delete(index);
    } else {
      notasVisibles.add(index);
    }
    cargarNotas();
    return;
  }

  // Temporizador activo pero aún no cumplido: no hacer nada, solo informar
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

cargarCategoriasEnSelect();
cargarNotas();

// Revisa cada 10 segundos si algún temporizador se cumplió, para ocultar la nota
// automáticamente sin que el usuario tenga que recargar la página.
setInterval(cargarNotas, 10000);