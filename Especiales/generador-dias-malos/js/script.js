const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

const nombre = pickName();
document.getElementById("greet").textContent = `Hola, ${nombre}.`;

const CARTAS = [
  {
    kind: "Mensaje",
    text: `${nombre}, el día se portó mal. Tú no. Punto.`,
    dog: "cream",
  },
  {
    kind: "Dato absurdo",
    text: "Las nutrias se toman de la mano para dormir. Hoy te toca versión humana: snack + cobija.",
    dog: "spot",
  },
  {
    kind: "Mensaje",
    text: "Permiso oficial para no ser productiva. El universo ya cubrió tu turno.",
    dog: "gray",
  },
  {
    kind: "Dato absurdo",
    text: "Un grupo de flamingos se llama flamboyance. Tú hoy eres una flamboyance de una sola persona.",
    dog: "cream",
  },
  {
    kind: "Perrito",
    text: "Este perrito no entiende tu día. Solo sabe que mereces un trato. Ciencia.",
    dog: "spot",
  },
  {
    kind: "Mensaje",
    text: `Si el día fuera una persona, ${nombre}, yo le pondría un límite. A ti te pondría un helado.`,
    dog: "gray",
  },
  {
    kind: "Dato absurdo",
    text: "Los pulpos tienen tres corazones. Tú con uno ya haces más de la cuenta.",
    dog: "cream",
  },
  {
    kind: "Mensaje",
    text: "Hoy no se gana. Hoy se sobrevive con estilo y una cara de “ya fue”.",
    dog: "spot",
  },
  {
    kind: "Perrito",
    text: "Traducción del ladrido: “estás bien, solo estás cansada, y eso cuenta”.",
    dog: "gray",
  },
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
let facts = shuffle(window.FACT_CHECKS || []);
let vistos = 0;

function nextFact() {
  if (!facts.length) facts = shuffle(window.FACT_CHECKS || []);
  const raw = facts.pop() || "Eres una persona increíble y este día no te define.";
  return "Fact check: " + raw.replaceAll("{nombre}", nombre);
}

function puppy(skin) {
  return `<div class="dog ${skin}" aria-hidden="true"><div class="pup">
    <div class="head"><i class="ear l"></i><i class="ear r"></i>
    <b class="eye l"></b><b class="eye r"></b></div>
    <div class="body"></div>
  </div></div>`;
}

async function dogMedia(skin) {
  if (location.protocol === "file:") return puppy(skin);
  try {
    const r = await fetch("https://random.dog/woof.json");
    const j = await r.json();
    if (j.url && /\.(gif|jpg|jpeg|png|webp)$/i.test(j.url)) {
      return `<img alt="perrito" src="${j.url}" />`;
    }
  } catch (_) {}
  try {
    const r = await fetch("https://dog.ceo/api/breeds/image/random");
    const j = await r.json();
    if (j.status === "success") return `<img alt="perrito" src="${j.message}" />`;
  } catch (_) {}
  return puppy(skin);
}

async function draw() {
  if (!mazo.length) mazo = shuffle(CARTAS);
  const item = mazo.pop();
  vistos += 1;
  const card = document.getElementById("card");
  card.classList.remove("pop");
  void card.offsetWidth;
  card.classList.add("pop");
  const media = await dogMedia(item.dog);
  card.innerHTML = `
    <p class="kind">${item.kind}</p>
    <div class="clip">${media}</div>
    <p class="msg">${item.text}</p>
  `;
  const fact = document.getElementById("fact");
  fact.classList.remove("pop");
  void fact.offsetWidth;
  fact.classList.add("pop");
  fact.textContent = nextFact();
  if (vistos >= 3) document.getElementById("treat").hidden = false;
  navigator.vibrate?.(40);
}

document.getElementById("go").addEventListener("click", () => {
  document.getElementById("start").hidden = true;
  document.getElementById("shot").hidden = false;
  draw();
});

document.getElementById("again").addEventListener("click", draw);

document.getElementById("treat").addEventListener("click", () => {
  document.getElementById("shot").hidden = true;
  const box = document.getElementById("date");
  box.hidden = false;
  box.innerHTML = `
    <h2>Ticket abierto</h2>
    <p>${nombre}, cero presión. Si hoy no, el ticket no se vence.</p>
    <p>Yo invito. Tú eliges el sabor del rescate.</p>
    <div class="picks">
      <button type="button" data-v="café">Café</button>
      <button type="button" data-v="helado">Helado</button>
      <button type="button" class="ghost" data-v="luego">Ahora no, pero lo guardo</button>
    </div>
    <p id="ok" hidden></p>
  `;
  box.querySelector(".picks").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const ok = document.getElementById("ok");
    ok.hidden = false;
    if (btn.dataset.v === "luego") {
      ok.textContent = "Guardado. Cuando quieras, lo cobras. Sin explicar el día.";
    } else {
      ok.textContent = `Listo: ${btn.dataset.v} por mi cuenta. Dime un rato que te quede y no le des más vueltas a hoy.`;
    }
  });
});
