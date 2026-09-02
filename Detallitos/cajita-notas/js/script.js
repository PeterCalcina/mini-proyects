const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return "Violeta";
}

const nombre = pickName();
document.getElementById("back").href += `?nombre=${encodeURIComponent(nombre)}`;
const hoy = new Date().getDay();
document.getElementById("lead").textContent =
  `Hola, ${nombre}. Raspa con el dedo. Hoy está marcado.`;

function fill(s) {
  return String(s).replaceAll("{nombre}", nombre);
}

const orden = [1, 2, 3, 4, 5, 6, 0];
const box = document.getElementById("days");

orden.forEach((d) => {
  const n = (window.NOTAS || {})[d] || { dia: "Día", texto: "…" };
  const art = document.createElement("article");
  art.className = "ticket" + (d === hoy ? " hoy" : "");
  art.innerHTML = `<header>${n.dia}${d === hoy ? " · hoy" : ""}</header>
    <p class="msg">${fill(n.texto)}</p>`;
  const canvas = document.createElement("canvas");
  art.appendChild(canvas);
  box.appendChild(art);
  foil(canvas);
});

function foil(canvas) {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#312e81";
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "rgba(196,181,253,0.18)";
  for (let i = 0; i < 18; i++) {
    ctx.fillRect(Math.random() * rect.width, Math.random() * rect.height, 40, 3);
  }
  ctx.fillStyle = "rgba(248,250,252,0.55)";
  ctx.font = "600 14px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("raspa aquí", rect.width / 2, rect.height / 2 + 5);

  let down = false;
  const scratch = (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  canvas.addEventListener("pointerdown", (e) => {
    down = true;
    canvas.setPointerCapture(e.pointerId);
    scratch(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (down) scratch(e);
  });
  canvas.addEventListener("pointerup", () => {
    down = false;
  });
}
