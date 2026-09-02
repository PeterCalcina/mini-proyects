const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre") || qs.get("nombres");
  const pool = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["Violeta"];
  return pool[Math.floor(Math.random() * pool.length)];
}

const nombre = pickName();
const folio = String(Math.floor(1000 + Math.random() * 9000));

const BANCO = [
  {
    q: "¿Cuánto es 1 + 1?",
    opts: ["2", "11", "Una ventana", "Depende del humor del 1"],
    ok: "2",
    twist: "dodge",
  },
  {
    q: "Si un tren sale a las 3 y otro a las 5, ¿de qué color es el tren?",
    opts: ["Azul", "El de las 3", "Sí", "Martes"],
    ok: "Azul",
    twist: "dodge",
  },
  {
    q: "Completa: El cielo es…",
    opts: ["Azul", "Un techo caro", "Mentira", "Arriba"],
    ok: "Azul",
    twist: "tomato",
  },
  {
    q: "¿Cuál de estos es un número primo?",
    opts: ["7", "Pizza", "Mi ex", "El WiFi de mis papás"],
    ok: "7",
    twist: "dodge",
  },
  {
    q: "¿Cuántas patas tiene un perro normal?",
    opts: ["4", "Guau", "Depende si está sentado", "3 y media"],
    ok: "4",
    twist: "shrink",
  },
  {
    q: "Selecciona la respuesta correcta.",
    opts: ["Esta", "Aquella", "Ninguna", "La de atrás"],
    ok: "Esta",
    twist: "tomato",
  },
  {
    q: "¿Qué sale si mezclas rojo y azul?",
    opts: ["Morado", "Un moretón", "Violeta, obvio", "Un problema"],
    ok: "Morado",
    twist: "dodge",
  },
  {
    q: "Si tienes 3 manzanas y comes 3, ¿cuántas te quedan?",
    opts: ["0", "Hambre", "Jugo", "Culpa"],
    ok: "0",
    twist: "shrink",
  },
  {
    q: "How do you say 'Perro' in English?",
    opts: ["Dog", "Cat", "Firulais", "El de la esquina"],
    ok: "Dog",
    twist: "dodge",
  },
  {
    q: "¿Cuál es la capital de Francia?",
    opts: ["París", "Torre Eiffel", "Croissant", "Europa"],
    ok: "París",
    twist: "tomato",
  },
  {
    q: "¿Qué animal produce leche?",
    opts: ["La vaca", "El lechero", "El supermercado", "El almendro"],
    ok: "La vaca",
    twist: "shrink",
  },
  {
    q: "Traduce: 'I love you'?",
    opts: ["Te amo", "Tengo frío", "Un café por favor", "Te debo dinero"],
    ok: "Te amo",
    twist: "dodge",
  },
  {
    q: "¿Qué gas necesitamos para respirar?",
    opts: ["Oxígeno", "Aire fresco", "Wifi", "Chisme"],
    ok: "Oxígeno",
    twist: "shrink",
  },
  {
    q: "¿Cuántos meses tienen 28 días?",
    opts: ["Todos", "Solo Febrero", "Ninguno", "Los de año bisiesto"],
    ok: "Todos",
    twist: "tomato",
  },
  {
    q: "¿En qué continente está Japón?",
    opts: ["Asia", "En el mapa", "Cerca del anime", "Lejos"],
    ok: "Asia",
    twist: "dodge",
  },
  {
    q: "¿Qué sonido hace un gato?",
    opts: ["Miau", "Dame comida", "Ostracismo", "El de las 3 AM"],
    ok: "Miau",
    twist: "shrink",
  },
  {
    q: "¿Cuál es el color del caballo blanco de Napoleón?",
    opts: ["Blanco", "Gris sucio", "Inexistente", "Napoleón"],
    ok: "Blanco",
    twist: "tomato",
  },
  {
    q: "Cual es el opuesto de 'Big'?",
    opts: ["Small", "Chiquito", "Medium", "Enano"],
    ok: "Small",
    twist: "dodge",
  },
  {
    q: "¿Cuál es la capital de Italia?",
    opts: ["Roma", "Pizza", "Spaghetti", "Milán"],
    ok: "Roma",
    twist: "shrink",
  },
  {
    q: "¿Qué planeta es conocido como el Planeta Rojo?",
    opts: ["Marte", "El del picante", "Júpiter", "El Sol"],
    ok: "Marte",
    twist: "tomato",
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

const preguntas = shuffle(BANCO).slice(0, 3);
let i = 0;
let fallos = 0;

document.getElementById("folio").textContent = folio;
document.getElementById("greet").textContent =
  `Hola, ${nombre}. Esto decide si te mereces un diploma… o un cocacho.`;

function honk() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  const blast = (freq, type, start, dur) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + start);
    o.frequency.exponentialRampToValueAtTime(
      freq * 0.45,
      ctx.currentTime + start + dur,
    );
    g.gain.setValueAtTime(0.95, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
    o.connect(g);
    g.connect(master);
    o.start(ctx.currentTime + start);
    o.stop(ctx.currentTime + start + dur);
  };

  blast(180, "square", 0, 0.35);
  blast(140, "sawtooth", 0.08, 0.4);
  blast(90, "square", 0.42, 0.45);
  navigator.vibrate?.([220, 60, 220, 60, 400]);
}

function markProgress() {
  for (let n = 1; n <= 3; n++) {
    const el = document.getElementById("p" + n);
    el.className = "";
    if (n <= i) el.classList.add("bad");
    else if (n === i + 1) el.classList.add("on");
  }
}

function swapWithOther(okBtn) {
  const buttons = [...document.querySelectorAll("button.opt")];
  const others = buttons.filter((b) => b !== okBtn);
  const target = others[Math.floor(Math.random() * others.length)];
  const parent = okBtn.parentElement;
  const a = document.createComment("");
  const b = document.createComment("");
  parent.replaceChild(a, okBtn);
  parent.replaceChild(b, target);
  parent.replaceChild(okBtn, b);
  parent.replaceChild(target, a);
}

function applyTwist(okBtn, twist, ev) {
  if (twist === "tomato") {
    okBtn.textContent = "Soy un tomate";
    okBtn.classList.add("tomato");
    okBtn.dataset.tomato = "1";
    swapWithOther(okBtn);
    return;
  }
  if (twist === "shrink") {
    const dx = window.innerWidth < 480 ? 28 : 80;
    okBtn.style.transform = `scale(0.55) translate(${dx}px, -10px)`;
    okBtn.style.opacity = "0.55";
    return;
  }
  swapWithOther(okBtn);
  if (ev?.clientX) {
    okBtn.style.transform = `translate(${ev.offsetX > 80 ? -40 : 40}px, ${Math.random() > 0.5 ? -12 : 12}px)`;
    setTimeout(() => {
      okBtn.style.transform = "";
    }, 180);
  }
}

function render() {
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("result");
  result.hidden = true;
  quiz.hidden = false;
  markProgress();

  if (i >= preguntas.length) {
    failScreen();
    return;
  }

  const item = preguntas[i];
  const opts = shuffle(item.opts);
  quiz.innerHTML = `
    <article class="q">
      <h2>${i + 1}. ${item.q}</h2>
      <div class="options">
        ${opts.map((o) => `<button class="opt" type="button" data-v="${o}">${o}</button>`).join("")}
      </div>
    </article>
  `;

  const okBtn = [...quiz.querySelectorAll("button.opt")].find(
    (b) => b.dataset.v === item.ok,
  );
  let cheated = false;
  let lock = false;

  const dodge = (ev) => {
    if (cheated || okBtn.dataset.tomato) return;
    cheated = true;
    ev.preventDefault();
    ev.stopPropagation();
    applyTwist(okBtn, item.twist, ev);
    document.querySelector(".sheet").classList.remove("shake");
    void document.querySelector(".sheet").offsetWidth;
    document.querySelector(".sheet").classList.add("shake");
    setTimeout(() => {
      cheated = false;
    }, 280);
  };

  okBtn.addEventListener("pointerenter", dodge);
  okBtn.addEventListener(
    "pointerdown",
    (ev) => {
      if (okBtn.dataset.tomato) return;
      dodge(ev);
      fallos += 1;
      lock = true;
      setTimeout(() => {
        lock = false;
      }, 320);
    },
    { capture: true },
  );

  quiz.querySelectorAll("button.opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn === okBtn) {
        if (btn.dataset.tomato && !lock) tomatoEnding();
        return;
      }
      if (lock) return;
      fallos += 1;
      i += 1;
      render();
    });
  });
}

function tomatoEnding() {
  honk();
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("result");
  quiz.hidden = true;
  result.hidden = false;
  result.innerHTML = `
    <h2>Correcto: eres un tomate.</h2>
    <p>${nombre}, el Ministerio te certifica como <strong>Solanum lycopersicum</strong>. Igual reprobaste. Los tomates no pueden ser genios.</p>
    <button class="again" type="button">Intentar no ser un tomate</button>
  `;
  result.querySelector(".again").onclick = () => location.reload();
}

function failScreen() {
  honk();
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("result");
  quiz.hidden = true;
  result.hidden = false;
  const score = Math.max(0, 12 - fallos * 4);
  result.innerHTML = `
    <h2>REPROBADO</h2>
    <p>Hola de nuevo, ${nombre}. CI estimado: <strong>${score}</strong>.</p>
    <p>Eso no es un número. Es un cocacho. Gracias por participar.</p>
    <button class="again" type="button">Repetir el sufrimiento</button>
  `;
  result.querySelector(".again").onclick = () => location.reload();
}

render();
