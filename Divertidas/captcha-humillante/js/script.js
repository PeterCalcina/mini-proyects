const qs = new URLSearchParams(location.search);

function listParam(key, fallback) {
  const raw = qs.get(key);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : fallback;
}

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

const greet = pickName();
const victimas = listParam("victimas", [greet]);
const anfitrion = qs.get("anfitrion") || "Pipo";
const famoso = qs.get("famoso") || "Messi";

document.getElementById("hello").textContent =
  `Hola, ${greet}. Esto es solo para ti. Demuestra que eres un humano real.`;

function svgFace({ bg, hair, skin, extra = "" }) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="120" height="120" fill="${bg}"/>
    <ellipse cx="60" cy="44" rx="28" ry="22" fill="${hair}"/>
    <circle cx="60" cy="58" r="24" fill="${skin}"/>
    <ellipse cx="60" cy="36" rx="26" ry="14" fill="${hair}"/>
    <circle cx="51" cy="56" r="3" fill="#2b2118"/>
    <circle cx="69" cy="56" r="3" fill="#2b2118"/>
    <path d="M54 68 q6 5 12 0" fill="none" stroke="#a56b4a" stroke-width="2"/>
    ${extra}
  </svg>`;
}

function svgDog() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#d7b899"/><ellipse cx="60" cy="70" rx="28" ry="22" fill="#8d5a2b"/><circle cx="42" cy="48" r="12" fill="#8d5a2b"/><circle cx="78" cy="48" r="12" fill="#8d5a2b"/><circle cx="52" cy="66" r="3" fill="#2b2118"/><circle cx="68" cy="66" r="3" fill="#2b2118"/><ellipse cx="60" cy="76" rx="6" ry="4" fill="#3a2a1a"/></svg>`;
}

function svgTomato() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#ffe8d6"/><circle cx="60" cy="68" r="32" fill="#e23d28"/><path d="M60 36 l8 14 h-16z" fill="#3d8b3d"/><circle cx="50" cy="64" r="3" fill="#2b2118"/><circle cx="70" cy="64" r="3" fill="#2b2118"/></svg>`;
}

function svgAlien() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0b1d16"/><ellipse cx="60" cy="62" rx="26" ry="32" fill="#7dff9a"/><ellipse cx="48" cy="58" rx="8" ry="12" fill="#111"/><ellipse cx="72" cy="58" rx="8" ry="12" fill="#111"/></svg>`;
}

function svgStatue() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#cfc8b8"/><rect x="40" y="30" width="40" height="58" fill="#9a9384"/><rect x="48" y="88" width="24" height="14" fill="#8a8374"/><circle cx="52" cy="50" r="2" fill="#4a453c"/><circle cx="68" cy="50" r="2" fill="#4a453c"/></svg>`;
}

const tiles = [
  ...victimas.map((name, i) => ({
    id: "v" + i,
    kind: "victim",
    name,
    src: `fotos/${name.toLowerCase()}.svg`,
    fallback: svgFace({
      bg: i % 2 ? "#efe4ff" : "#ffe8d2",
      hair: i % 2 ? "#4a2c6a" : "#c47a4a",
      skin: "#f2c7a0",
    }),
  })),
  {
    id: "host",
    kind: "pass",
    name: anfitrion,
    src: "fotos/anfitrion.svg",
    fallback: svgFace({
      bg: "#dbeafe",
      hair: "#2b2118",
      skin: "#e8b894",
      extra: `<rect x="38" y="86" width="44" height="18" fill="#1d4ed8"/>`,
    }),
  },
  {
    id: "fame",
    kind: "pass",
    name: famoso,
    src: "fotos/famoso.svg",
    fallback: svgFace({
      bg: "#dcfce7",
      hair: "#1c1917",
      skin: "#e8b894",
      extra: `<text x="60" y="112" text-anchor="middle" font-size="10" fill="#14532d">★</text>`,
    }),
  },
  { id: "dog", kind: "decoy", fallback: svgDog() },
  { id: "tomato", kind: "decoy", fallback: svgTomato() },
  { id: "alien", kind: "decoy", fallback: svgAlien() },
  { id: "statue", kind: "decoy", fallback: svgStatue() },
  {
    id: "chair",
    kind: "decoy",
    fallback: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#f3e8d8"/><rect x="38" y="42" width="44" height="10" fill="#7c4a1e"/><rect x="40" y="52" width="8" height="36" fill="#5c3412"/><rect x="72" y="52" width="8" height="36" fill="#5c3412"/><rect x="36" y="50" width="48" height="8" fill="#8b5a2b"/></svg>`,
  },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const must = tiles.filter((t) => t.kind !== "decoy");
const decoys = shuffle(tiles.filter((t) => t.kind === "decoy"));
const gridItems = shuffle(must.concat(decoys.slice(0, Math.max(0, 9 - must.length))));
const grid = document.getElementById("grid");
const selected = new Set();

gridItems.forEach((item) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tile";
  btn.dataset.id = item.id;
  btn.innerHTML = item.src
    ? `<img alt="" src="${item.src}" />`
    : item.fallback;
  btn.addEventListener("click", () => {
    if (selected.has(item.id)) selected.delete(item.id);
    else selected.add(item.id);
    btn.classList.toggle("on", selected.has(item.id));
    document.getElementById("status").textContent = "";
  });
  const img = btn.querySelector("img");
  if (img) {
    img.addEventListener("error", () => {
      btn.innerHTML = item.fallback;
    });
  }
  grid.appendChild(btn);
});

document.getElementById("verify").addEventListener("click", () => {
  const picked = gridItems.filter((t) => selected.has(t.id));
  const status = document.getElementById("status");
  if (!picked.length) {
    status.textContent = "Selecciona al menos una imagen.";
    return;
  }

  const hasVictim = picked.some((t) => t.kind === "victim");
  const hasPass = picked.some((t) => t.kind === "pass");
  const hasDecoy = picked.some((t) => t.kind === "decoy");

  if (hasVictim) {
    status.textContent = "Error: objeto no encontrado. Por favor selecciona humanos reales.";
    return;
  }
  if (hasDecoy || !hasPass) {
    status.textContent = "Casi. Eso no cuenta como humano atractivo. Inténtalo de nuevo.";
    return;
  }

  document.querySelector(".captcha").hidden = true;
  const pass = document.getElementById("pass");
  pass.hidden = false;
  pass.innerHTML = `
    <h2>Acceso concedido</h2>
    <p>${greet}, tu gusto es cuestionable, pero al menos reconociste un humano real.</p>
    <button class="again" type="button">Otro captcha</button>
  `;
  pass.querySelector(".again").onclick = () => location.reload();
});
