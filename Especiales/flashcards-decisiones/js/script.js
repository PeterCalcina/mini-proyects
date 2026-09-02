const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

// Cosas que notaste de ella. Cambia esto o pásalo por la URL.
const CONFIG = {
  nombre: pickName(),
  postre: qs.get("postre") || "ese postre que pediste “solo un poquito”",
  serie: qs.get("serie") || "tu serie de consuelo",
  comida: qs.get("comida") || "lo que pediste la última vez y te salvó el ánimo",
  cancion: qs.get("cancion") || "esa canción que pusiste y fingiste que no era tuya",
};

const nombre = CONFIG.nombre;
document.getElementById("greet").textContent = `Hola, ${nombre}.`;

const CARTAS = [
  { tag: "Comer", title: "¿Pedir pizza?", note: "Cero sartenes. Cero dignidad. Máxima paz." },
  { tag: "Pantalla", title: "¿Ver una peli?", note: "Aunque sea media. Aunque te duermas en los créditos." },
  { tag: "Drama legal", title: "¿Hacer berrinche 5 minutos?", note: "Timer puesto. Después agua y ya." },
  { tag: "Cuerpo", title: "¿Una siesta sin culpa?", note: "El mundo puede esperar 27 minutos." },
  { tag: "Tú", title: `¿Un poco de ${CONFIG.postre}?`, note: "Lo mencionaste. Yo no lo olvidé." },
  { tag: "Tú", title: `¿Un capítulo de ${CONFIG.serie}?`, note: "La de siempre. La que te acomoda el día." },
  { tag: "Tú", title: `¿Pedir ${CONFIG.comida}?`, note: "No es random. Es investigación de campo." },
  { tag: "Tú", title: `¿Poner ${CONFIG.cancion} y no explicar?`, note: "A veces el mood se arregla solo." },
  { tag: "Suave", title: "¿Ducharte y fingir que eres otra persona?", note: "Funciona el 70% de las veces." },
  { tag: "Caos", title: "¿No decidir y tirarte al sofá?", note: "También es una decisión. De las buenas." },
];

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

let mazo = shuffle(CARTAS);
const deck = document.getElementById("deck");

function render() {
  deck.innerHTML = "";
  const top = mazo[0];
  const next = mazo[1];
  if (next) deck.appendChild(makeCard(next, true));
  if (top) deck.appendChild(makeCard(top, false));
  else empty();
}

function makeCard(item, back) {
  const el = document.createElement("article");
  el.className = "card" + (back ? " back" : "");
  el.innerHTML = `<p class="tag">${item.tag}</p><h2>${item.title}</h2><p>${item.note}</p>`;
  return el;
}

function topCard() {
  return deck.querySelector(".card:not(.back)");
}

{
  let x0 = 0;
  let dx = 0;
  let down = false;
  deck.addEventListener("pointerdown", (e) => {
    const el = topCard();
    if (!el || e.target.closest(".back")) return;
    down = true;
    dx = 0;
    x0 = e.clientX;
    el.style.transition = "none";
    deck.setPointerCapture?.(e.pointerId);
  });
  deck.addEventListener("pointermove", (e) => {
    if (!down) return;
    const el = topCard();
    if (!el) return;
    dx = e.clientX - x0;
    el.style.transform = `translateX(${dx}px) rotate(${dx / 28}deg)`;
  });
  deck.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    const el = topCard();
    if (!el) return;
    el.style.transition = "transform 0.25s ease";
    if (dx > 80) decide(true, el);
    else if (dx < -80) decide(false, el);
    else {
      el.style.transform = "";
      dx = 0;
    }
  });
}

let busy = false;

function decide(yes, el) {
  const item = mazo[0];
  if (busy || !item) return;
  busy = true;
  if (yes) {
    if (el) el.style.transform = "translateX(130%) rotate(18deg)";
    setTimeout(() => lock(item), 180);
  } else {
    if (el) el.style.transform = "translateX(-130%) rotate(-18deg)";
    setTimeout(() => {
      mazo.push(mazo.shift());
      busy = false;
      render();
    }, 180);
  }
}

function lock(item) {
  document.getElementById("hint").hidden = true;
  document.querySelector(".btns").hidden = true;
  deck.hidden = true;
  const box = document.getElementById("done");
  box.hidden = false;
  box.innerHTML = `
    <h2>Decidido.</h2>
    <p>${item.title.replace("¿", "").replace("?", "")}</p>
    <p>${nombre}, ya no le des más vueltas. ${item.tag === "Tú" ? "Esa la anoté de ti." : "Si no pega, deslizas otra."}</p>
    <button class="again" type="button">Otra ronda</button>
  `;
  box.querySelector(".again").onclick = () => location.reload();
}

function empty() {
  document.getElementById("hint").textContent = "Se acabó el mazo. Eso también es una señal.";
}

document.getElementById("yes").addEventListener("click", () => decide(true, topCard()));
document.getElementById("no").addEventListener("click", () => decide(false, topCard()));

render();
