const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre") || qs.get("nombres");
  const pool = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : ["Brisa", "Violeta"];
  return pool[Math.floor(Math.random() * pool.length)];
}

const nombre = pickName();
const hex = () =>
  Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

document.getElementById("gateText").textContent =
  `Hola, ${nombre}. Un proceso de Windows necesita tu permiso para revisar archivos recientes.`;

const busquedas = shuffle([
  `cómo parecer ocupada cuando me escribe ${nombre}`,
  "recetas de soda que cuenten como cena",
  "es legal reírse de tu propia cara en las fotos",
  `traducir “te debo una” al idioma de ${nombre}`,
  "gatos bailando 10 horas",
  "cómo borrar un mensaje visto",
  "por qué mi cara sale así en las selfies",
  "invitaciones a cerveza que no parezcan desesperadas",
]);

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

document.getElementById("allow").addEventListener("click", async () => {
  document.getElementById("gate").hidden = true;
  document.getElementById("panic").hidden = false;
  document.getElementById("panicLead").textContent =
    "Iniciando descarga de historial de búsqueda para enviárselo a quien te mandó esto…";
  document.getElementById("code").textContent =
    `STOP: 0x${hex()}${hex()}  ·  usuario: ${nombre.toLowerCase()}`;

  try {
    await document.documentElement.requestFullscreen();
  } catch (_) {
    /* si el navegador lo bloquea, igual sigue el susto */
  }

  runPanic();
});

function runPanic() {
  const bar = document.getElementById("bar");
  const pct = document.getElementById("pct");
  const log = document.getElementById("log");
  let p = 0;
  let i = 0;

  const tick = setInterval(() => {
    p += 6 + Math.floor(Math.random() * 9);
    if (p > 100) p = 100;
    bar.style.width = p + "%";
    pct.textContent = p + "% completado";

    if (i < busquedas.length && Math.random() > 0.35) {
      const li = document.createElement("li");
      li.textContent = `exportando: ${busquedas[i]}`;
      log.prepend(li);
      i += 1;
    }

    if (p >= 100) {
      clearInterval(tick);
      setTimeout(reveal, 500);
    }
  }, 140);
}

function reveal() {
  document.getElementById("panic").hidden = true;
  const box = document.getElementById("reveal");
  box.hidden = false;
  document.getElementById("revealText").textContent =
    `${nombre}, no se envió nada. Invítame una soda o una cerveza por el susto.`;
  try {
    document.exitFullscreen();
  } catch (_) {}
}

document.getElementById("again").addEventListener("click", () => location.reload());
