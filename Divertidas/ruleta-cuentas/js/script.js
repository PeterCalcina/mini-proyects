const qs = new URLSearchParams(location.search);
const COLORS = ["#8b1e1e", "#1e3a5f", "#2d6a4f", "#6b3fa0", "#b45309", "#0f766e", "#9f1239"];

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

function namesFromUrl(quien) {
  const raw = qs.get("nombres");
  const list = (raw || `${quien},Yo,Destino,Suerte`)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const victima = qs.get("victima") || quien;
  if (!list.some((n) => n.toLowerCase() === victima.toLowerCase())) {
    list.unshift(victima);
  }
  return list;
}

function findVictim(list, quien) {
  const raw = qs.get("victima") || quien;
  return list.find((n) => n.toLowerCase() === raw.toLowerCase()) || raw;
}

const greet = pickName();
const names = namesFromUrl(greet);
const victima = findVictim(names, greet);
const slice = 360 / names.length;

document.getElementById("sub").textContent =
  `Hola, ${greet}. Tú y yo. La ruleta es 100% justa. Lo jura el código.`;

const wheel = document.getElementById("wheel");
wheel.style.background = `conic-gradient(${names
  .map((n, i) => `${COLORS[i % COLORS.length]} ${i * slice}deg ${(i + 1) * slice}deg`)
  .join(",")})`;

const labelR = Math.max(70, wheel.clientWidth / 2 - 42);
names.forEach((n, i) => {
  const span = document.createElement("span");
  span.textContent = n;
  const deg = (i + 0.5) * slice;
  span.style.transform = `translate(-50%, -50%) rotate(${deg}deg) translateY(-${labelR}px)`;
  span.style.left = "50%";
  span.style.top = "50%";
  span.style.position = "absolute";
  wheel.appendChild(span);
});

{
  const n = 4;
  const s = 360 / n;
  const idx = 2;
  const rot = 360 * 6 - (idx + 0.5) * s;
  const landed = ((idx + 0.5) * s + rot) % 360;
  console.assert(landed < 0.01 || Math.abs(landed - 360) < 0.01, "la ruleta no cae en la víctima");
}

let spinning = false;
document.getElementById("spin").addEventListener("click", () => {
  if (spinning) return;
  spinning = true;
  document.getElementById("spin").disabled = true;
  document.getElementById("sub").textContent = "El destino está… eligiendo con mucho teatro.";

  const idx = names.findIndex((n) => n.toLowerCase() === victima.toLowerCase());
  const safeIdx = idx >= 0 ? idx : 0;
  const extra = 360 * (5 + Math.floor(Math.random() * 3));
  const target = extra - (safeIdx + 0.5) * slice;
  wheel.style.transform = `rotate(${target}deg)`;

  setTimeout(() => {
    boom();
  }, 4700);
});

function boom() {
  const box = document.getElementById("boom");
  box.hidden = false;
  box.innerHTML = `
    <h2>${victima} paga hoy</h2>
    <p>Silencio dramático. Hoy invitas tú: pizza, soda o lo que toque.</p>
    <p style="margin-top:10px;opacity:.7">La ruleta ha hablado. (Y yo también.)</p>
    <p><button class="again" type="button">Otra ronda “justa”</button></p>
  `;
  box.querySelector(".again").onclick = () => location.reload();
  confetti();
}

function confetti() {
  const layer = document.createElement("div");
  layer.className = "confetti";
  document.body.appendChild(layer);
  for (let i = 0; i < 48; i++) {
    const bit = document.createElement("i");
    bit.style.left = Math.random() * 100 + "%";
    bit.style.background = COLORS[i % COLORS.length];
    bit.style.animationDelay = Math.random() * 0.6 + "s";
    layer.appendChild(bit);
  }
  setTimeout(() => layer.remove(), 3200);
}
