const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("yo") || qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

let yo = pickName();
let otro = qs.get("otro") || "Yo";

const culpableSecreto = qs.get("culpable") || otro;
let rigged = false;

const PREGUNTAS = [
  "¿Quién de los dos es más tacaño?",
  "¿Quién pide más comida y después dice “estoy llena”?",
  "¿Quién llega siempre tarde?",
  "¿Quién es más dramático cuando se acaba el WiFi?",
  "¿Quién manda más audios de 3 minutos?",
  "¿Quién dice “yo invito” y después se esconde?",
  "¿Quién tiene el historial más comprometedor?",
  "¿Quién se ríe de sus propios chistes?",
  "¿Quién es peor perdedor en un juego?",
  "¿Quién empieza el chisme y luego dice “yo no fui”?",
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

document.getElementById("lead").textContent =
  `Hola, ${yo}. Tú contra mí. Responde con honestidad: el sensor no perdona.`;
document.getElementById("yo").value = yo;
document.getElementById("otro").value = otro;

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "k") rigged = true;
});

const pad = document.getElementById("secretPad");
let hold;
pad.addEventListener("pointerdown", () => {
  hold = setTimeout(() => {
    rigged = true;
  }, 900);
});
["pointerup", "pointerleave"].forEach((ev) =>
  pad.addEventListener(ev, () => clearTimeout(hold))
);

document.getElementById("setup").addEventListener("submit", (e) => {
  e.preventDefault();
  yo = document.getElementById("yo").value.trim() || yo;
  otro = document.getElementById("otro").value.trim() || otro;
  document.getElementById("setup").hidden = true;
  startQuiz();
});

function startQuiz() {
  const form = document.getElementById("quiz");
  const qsPick = shuffle(PREGUNTAS).slice(0, 4);
  form.hidden = false;
  form.innerHTML =
    qsPick
      .map(
        (q, i) => `
      <div class="q">
        <p>${i + 1}. ${q}</p>
        <div class="choices" data-i="${i}">
          <button type="button" class="choice" data-v="yo">${yo}</button>
          <button type="button" class="choice" data-v="otro">${otro}</button>
          <button type="button" class="choice" data-v="empate">Empate sospechoso</button>
        </div>
      </div>`
      )
      .join("") + `<button type="submit">Enviar al laboratorio</button>`;

  form.querySelectorAll(".choices").forEach((row) => {
    row.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".choice");
      if (!btn) return;
      row.querySelectorAll(".choice").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
    });
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const filled = [...form.querySelectorAll(".choices")].every((row) =>
      row.querySelector(".on")
    );
    if (!filled) {
      document.getElementById("lead").textContent =
        "El sensor detectó cobardía: responde todas.";
      return;
    }
    form.hidden = true;
    scan();
  });
}

function scan() {
  const box = document.getElementById("scan");
  const text = document.getElementById("scanText");
  const pct = document.getElementById("pct");
  box.hidden = false;

  const lines = [
    "Calibrando ritmo cardíaco…",
    "Cruzando chats de 2019…",
    "Detectando sudor en el pulgar…",
    `Comparando a ${yo} con ${otro}…`,
    "Buscando contradicciones…",
  ];

  let t = 0;
  const id = setInterval(() => {
    t += 4 + Math.floor(Math.random() * 7);
    if (t > 100) t = 100;
    pct.textContent = t + "%";
    text.textContent = lines[Math.min(lines.length - 1, Math.floor(t / 22))];
    if (t >= 100) {
      clearInterval(id);
      setTimeout(verdict, 400);
    }
  }, 80);
}

function verdict() {
  document.getElementById("scan").hidden = true;
  const box = document.getElementById("verdict");
  box.hidden = false;

  const blame = rigged ? culpableSecreto : yo;
  const ok = rigged;
  box.className = "verdict" + (ok ? " ok" : "");
  const conf = 86 + Math.floor(Math.random() * 13);

  box.innerHTML = ok
    ? `
      <h2>VERDAD REGISTRADA</h2>
      <p>El algoritmo (muy científico) señala a <strong>${blame}</strong>.</p>
      <p>${yo} queda libre… por ahora. Confianza: ${conf}%.</p>
      <div class="meter"><i style="width:${conf}%;background:#7dff9a"></i></div>
      <button class="again" type="button">Otra ronda</button>`
    : `
      <h2>MENTIRA DETECTADA</h2>
      <p>¡Eres tú, <strong>${yo}</strong>!</p>
      <p>Da igual lo que marcaste. El polígrafo ya decidió. Confianza: ${conf}%.</p>
      <div class="meter"><i style="width:${conf}%"></i></div>
      <button class="again" type="button">Negarlo otra vez</button>`;

  box.querySelector(".again").onclick = () => location.reload();
}
