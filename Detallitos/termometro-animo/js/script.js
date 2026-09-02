const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return "Violeta";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const nombre = pickName();
document.getElementById("back").href += `?nombre=${encodeURIComponent(nombre)}`;
document.getElementById("lead").textContent =
  `Hola, ${nombre}. Arrastra el puntito. El recetario se abre solo.`;

const slider = document.getElementById("slider");
const thumb = document.getElementById("thumb");
const num = document.getElementById("num");
const mercury = document.getElementById("mercury");
const bandName = document.getElementById("bandName");
const rx = document.getElementById("rx");
const recetas = window.RECETAS || {};
let value = 50;

const LABELS = { bajo: "día pesado", medio: "tirando", alto: "se te nota el sol" };

function fill(s) {
  return String(s || "").replaceAll("{nombre}", nombre);
}

function banda(v) {
  if (v <= 40) return "bajo";
  if (v >= 75) return "alto";
  return "medio";
}

function packOf(band) {
  return recetas[band] || {
    notas: ["Si el día está pesado, aquí hay un recordatorio de lo increíble que eres."],
    chistes: ["Hoy cuenta igual."],
  };
}

async function tierno() {
  if (location.protocol === "file:") return `<div class="tierno">🤍</div>`;
  try {
    const r = await fetch("https://dog.ceo/api/breeds/image/random");
    const j = await r.json();
    if (j.status === "success") return `<img alt="tierno" src="${j.message}" />`;
  } catch (_) {}
  return `<div class="tierno">🤍</div>`;
}

let lastBand = "";
let lastShown = "";
let confettiOn = false;
let wait;

function confetti() {
  if (confettiOn) return;
  confettiOn = true;
  const layer = document.createElement("div");
  layer.className = "confetti";
  document.body.appendChild(layer);
  const colors = ["#d36b4f", "#e8b86d", "#7eb77e", "#6b8cae", "#c989c0"];
  for (let i = 0; i < 42; i++) {
    const bit = document.createElement("i");
    bit.style.left = Math.random() * 100 + "%";
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = Math.random() * 0.5 + "s";
    layer.appendChild(bit);
  }
  setTimeout(() => {
    layer.remove();
    confettiOn = false;
  }, 2800);
}

function paint(v) {
  value = v;
  const band = banda(v);
  num.textContent = v;
  mercury.style.width = v + "%";
  thumb.style.left = v + "%";
  slider.setAttribute("aria-valuenow", String(v));
  bandName.textContent = LABELS[band];
  document.body.dataset.band = band;
}

async function recipe(v) {
  const band = banda(v);
  if (band === lastShown) return;
  lastShown = band;
  const pack = packOf(band);
  rx.hidden = false;
  rx.innerHTML = `
    <div class="clip"><div class="tierno">${band === "alto" ? "✦" : "🤍"}</div></div>
    <p class="joke">${fill(pick(pack.chistes))}</p>
    <p class="note">${fill(pick(pack.notas))}</p>
  `;
  if (band !== "alto") {
    const media = await tierno();
    const clip = rx.querySelector(".clip");
    if (clip && lastShown === band) clip.innerHTML = media;
  }
  if (band === "alto" && lastBand !== "alto") confetti();
  lastBand = band;
}

function valueFromX(clientX) {
  const r = slider.getBoundingClientRect();
  const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  return Math.round(t * 99) + 1;
}

function onSlide(v) {
  paint(v);
  clearTimeout(wait);
  wait = setTimeout(() => recipe(v), 80);
}

let dragging = false;

function move(e) {
  if (!dragging) return;
  onSlide(valueFromX(e.clientX));
}

function stop() {
  dragging = false;
}

slider.addEventListener("pointerdown", (e) => {
  dragging = true;
  try {
    slider.setPointerCapture(e.pointerId);
  } catch (_) {}
  onSlide(valueFromX(e.clientX));
});
slider.addEventListener("pointermove", move);
slider.addEventListener("pointerup", stop);
slider.addEventListener("pointercancel", stop);
window.addEventListener("pointermove", move);
window.addEventListener("pointerup", stop);
slider.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowUp") onSlide(Math.min(100, value + 5));
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") onSlide(Math.max(1, value - 5));
});

paint(50);

document.getElementById("float").addEventListener("click", () => {
  const hug = document.getElementById("hug");
  hug.innerHTML = `
    <div class="box">
      <div class="cup">☕</div>
      <p><strong>Café a tu temperatura.</strong></p>
      <p>Y un abrazo que no apura. ${nombre}, aquí estoy.</p>
      <button type="button" id="cerrar">Guardar el calor</button>
    </div>
  `;
  hug.classList.add("is-on");
  document.getElementById("cerrar").onclick = () => {
    hug.classList.remove("is-on");
  };
});
