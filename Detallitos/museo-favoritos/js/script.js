const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return "Violeta";
}

const nombre = pickName();
document.getElementById("back").href += `?nombre=${encodeURIComponent(nombre)}`;
const data = window.MUSEO || { piezas: [], plan: "algo lindo, sin prisa" };

document.getElementById("lead").textContent =
  `Hola, ${nombre}. Toca cada ficha. Nada de esto lo inventé: lo fuiste diciendo.`;

function fill(s) {
  return String(s).replaceAll("{nombre}", nombre);
}

const grid = document.getElementById("grid");

data.piezas.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ficha";
  btn.innerHTML = `
    <p class="sala">Ficha ${String(i + 1).padStart(2, "0")} · ${fill(p.sala)}</p>
    <h2>${fill(p.titulo)}</h2>
    <p class="objeto">${fill(p.objeto)}</p>
    <p class="nota">${fill(p.nota)}</p>
  `;
  btn.addEventListener("click", () => btn.classList.toggle("open"));
  grid.appendChild(btn);
});

const last = document.createElement("button");
last.type = "button";
last.className = "ficha reserva";
last.innerHTML = `
  <p class="sala">Próxima exhibición</p>
  <h2>Espacio reservado para ${nombre}</h2>
  <p class="objeto">Próximamente: ${fill(data.plan)}</p>
  <p class="nota">Todavía no tiene fecha. Tiene ganas.</p>
`;
last.addEventListener("click", () => last.classList.toggle("open"));
grid.appendChild(last);
