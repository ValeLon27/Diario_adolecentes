const form = document.getElementById('form-nota');
const input = document.getElementById('input-nota');
const lista = document.getElementById('lista-notas');

// Cargar notas guardadas al abrir la página
function cargarNotas() {
  const notas = JSON.parse(localStorage.getItem('notas')) || [];
  lista.innerHTML = '';
  notas.forEach((nota, index) => {
    const li = document.createElement('li');
    li.textContent = nota;
    lista.appendChild(li);
  });
}

// Guardar una nueva nota
form.addEventListener('submit', function (e) {
  e.preventDefault(); // evita que la página se recargue
  const texto = input.value.trim();
  if (texto === '') return;

  const notas = JSON.parse(localStorage.getItem('notas')) || [];
  notas.push(texto);
  localStorage.setItem('notas', JSON.stringify(notas));

  input.value = '';
  cargarNotas();
});

cargarNotas();