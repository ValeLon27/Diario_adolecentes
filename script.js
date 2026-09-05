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

// Guarda temporalmente qué notas están "desbloqueadas para ver" en esta sesión.
// Se reinicia cada vez que recargas la página (por seguridad).
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

function cargarNotas() {
  const notas = obtenerNotas();
  lista.innerHTML = '';

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
    botonCandado.className = 'boton-candado';

    fila.appendChild(badge);
    fila.appendChild(botonCandado);

    const texto = document.createElement('p');

    const estaVisible = notasVisibles.has(index);

    if (nota.bloqueada && !estaVisible) {
      // Nota bloqueada y no desbloqueada en esta sesión: ocultar contenido
      botonCandado.textContent = '🔒';
      texto.textContent = 'Nota privada. Haz clic en el candado para verla.';
      texto.classList.add('texto-oculto');
    } else {
      // Nota visible (sin bloqueo, o bloqueada pero ya se ingresó el PIN)
      botonCandado.textContent = nota.bloqueada ? '🔓' : '➕🔒';
      texto.textContent = nota.texto;
      texto.classList.remove('texto-oculto');
    }

    botonCandado.addEventListener('click', () => manejarCandado(index));

    li.appendChild(fila);
    li.appendChild(texto);
    lista.appendChild(li);
  });
}

function manejarCandado(index) {
  const notas = obtenerNotas();
  const nota = notas[index];

  if (!nota.bloqueada) {
    // La nota no tiene PIN todavía: crear uno
    const pin = prompt('Crea un PIN para proteger esta nota:');
    if (!pin) return; // si cancela o deja vacío, no hace nada
    nota.bloqueada = true;
    nota.pin = pin;
    guardarNotas(notas);
    notasVisibles.delete(index); // se oculta de inmediato tras bloquearla
    cargarNotas();
    return;
  }

  if (notasVisibles.has(index)) {
    // Ya estaba visible: volver a ocultarla
    notasVisibles.delete(index);
    cargarNotas();
    return;
  }

  // Está bloqueada y oculta: pedir el PIN para revelarla
  const intento = prompt('Ingresa el PIN para ver esta nota:');
  if (intento === null) return; // canceló
  if (intento === nota.pin) {
    notasVisibles.add(index);
    cargarNotas();
  } else {
    alert('PIN incorrecto.');
  }
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
    pin: null
  };

  const notas = obtenerNotas();
  notas.push(nuevaNota);
  guardarNotas(notas);

  input.value = '';
  cargarNotas();
});

cargarCategoriasEnSelect();
cargarNotas();