const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return Math.random() < 0.5 ? "Brisa" : "Violeta";
}

const nombre = pickName();
document.getElementById("lead").textContent =
  `Hola, ${nombre}. Tres preguntas. Cero seriedad. Un veredicto útil.`;

const cafes = document.getElementById("cafes");
["0", "1", "2", "3+"].forEach((n, i) => {
  const id = "c" + i;
  cafes.insertAdjacentHTML(
    "beforeend",
    `<label for="${id}"><input id="${id}" type="radio" name="cafe" value="${n}" ${i === 1 ? "checked" : ""} />${n}</label>`
  );
});

const gente = document.getElementById("gente");
const genteN = document.getElementById("genteN");
gente.addEventListener("input", () => {
  genteN.textContent = gente.value;
});

const SIESTA = [
  `Solicitud de 12 horas: denegada por el universo, aprobada por mí. Te autorizo 90 minutos de verdad y que el resto del día se declare inhábil. ${nombre}, el mundo no se desordena si cierras los ojos.`,
  `12 horas es un turno de hospital. Tú no estás de guardia. Receta: celular lejos, cobija cerca, y si alguien pregunta, yo digo que estás en una reunión muy importante con una almohada.`,
  `El sistema no puede mover el sol. Puede hacer esto: apaga una luz, bebe agua y duerme como si mañana no existiera. Spoiler: mañana existe, pero más suave si hoy descansas.`,
];

const FINDE = [
  `El viernes no se adelanta. Una salida sí. ¿Vamos un rato? Cero plan grande: una vuelta, un helado, que el día se sienta menos oficina.`,
  `Administración rechazó mover el sábado. Contraoferta: salimos un rato y fingimos que ya es finde. Si no quieres, el plan se guarda. Si sí, yo invito el antojo.`,
  `${nombre}, el fin de semana está en camino. Si quieres, lo estrenamos temprano: un airecito, algo rico y nada de “tenemos que”. Solo salir un poco.`,
];

// Edita o agrega. Salen al azar sobre una imagen de meme.
const MEMES_MALOS = [
  { top: "NADIE:", bottom: "YO EXPLICANDO POR QUÉ ESTOY CANSADA SIN HABER HECHO NADA “DE VERDAD”" },
  { top: "EL LUNES", bottom: "YO AÚN ESPERANDO QUE ME DEVUELVAN EL DOMINGO" },
  { top: "CERRAR LOS OJOS 5 MINUTOS", bottom: "DESPERTAR EN OTRO GOBIERNO" },
  { top: "MI TO-DO LIST", bottom: "YO: “MAÑANA SÍ” (ES JUEVES)" },
  { top: "GENTE SIENDO GENTE", bottom: "YO PIDIENDO UNA SIESTA COMO POLÍTICA DE ESTADO" },
  { top: "TRABAJAR", bottom: "MIRAR EL MISMO MENSAJE 14 VECES Y NO CONTESTAR" },
  { top: "VIDA ADULTA", bottom: "CELEBRAR QUE HAY PAN" },
  { top: "YO DICIENDO “ESTOY BIEN”", bottom: "MI CARA PIDIENDO SOPA Y SILENCIO" },
  { top: "UN DÍA PRODUCTIVO", bottom: "ME LEVANTÉ. FIN DEL INFORME." },
  { top: "EL CAFÉ", bottom: "NO HIZO NADA. SOLO ME ACOMPAÑÓ EN EL DRAMA." },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function memeSrc() {
  if (location.protocol === "file:") return "";
  try {
    const r = await fetch("https://api.imgflip.com/get_memes");
    const j = await r.json();
    const list = (j.data?.memes || []).filter((m) => m.url);
    return list.length ? pick(list).url : "";
  } catch (_) {
    return "";
  }
}

function bindLater(out) {
  const luego = document.getElementById("luego");
  if (luego) {
    luego.onclick = () => {
      out.innerHTML = `
        <h2>Ticket en espera</h2>
        <p>Cero presión, ${nombre}. El informe no se vence. Cuando el día baje un poco, ahí está.</p>
      `;
    };
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const cafe = document.querySelector("[name=cafe]:checked").value;
  const genteV = Number(gente.value);
  const urge = document.querySelector("[name=urge]:checked").value;
  const nota = 4 + (10 - genteV) + (cafe === "0" ? 0 : cafe === "1" ? 1 : 2);
  const folio = 100 + Math.floor(Math.random() * 800);

  document.getElementById("form").hidden = true;
  const out = document.getElementById("out");
  out.hidden = false;
  out.innerHTML = `<p class="stamp">PROCESADO</p><h2>Informe #${folio}</h2>
    <p>Café: ${cafe}. Gente: ${genteV}/10. Índice de “ya basta”: ${Math.min(10, nota)}.</p>
    <p>Cargando veredicto…</p>`;

  let extra = "";
  if (urge === "siesta") {
    extra = `<p>${pick(SIESTA)}</p>
      <p><strong>Cuando despiertes, el sistema sigue recomendando una conversación tranquila. ¿Aceptas?</strong></p>
      <button type="button" id="si">Acepto</button>
      <button type="button" id="luego" class="ghost">Ahora no, pero quedó anotado</button>`;
  } else if (urge === "finde") {
    extra = `<p>${pick(FINDE)}</p>
      <button type="button" id="si">Dale, salgamos</button>
      <button type="button" id="luego" class="ghost">Ahora no</button>`;
  } else {
    const cap = pick(MEMES_MALOS);
    const src = await memeSrc();
    extra = `<div class="meme">
        ${src ? `<img alt="meme" src="${src}" />` : `<div class="meme-ph" aria-hidden="true">😐☕</div>`}
        <span class="t">${cap.top}</span>
        <span class="b">${cap.bottom}</span>
      </div>
      <p>Calidad del meme: deliberadamente mala. Como el día. Tú no.</p>
      <p><strong>El sistema también recomienda una conversación tranquila. ¿Aceptas?</strong></p>
      <button type="button" id="si">Acepto</button>
      <button type="button" id="luego" class="ghost">Ahora no, pero quedó anotado</button>`;
  }

  out.innerHTML = `<p class="stamp">PROCESADO</p><h2>Informe #${folio}</h2>
    <p>Café: ${cafe}. Gente: ${genteV}/10. Índice de “ya basta”: ${Math.min(10, nota)}.</p>
    ${extra}`;

  const si = document.getElementById("si");
  if (si) {
    si.onclick = () => {
      out.innerHTML =
        urge === "finde"
          ? `<h2>Plan abierto</h2>
             <p>${nombre}, no tiene que ser largo. Una vuelta, algo rico, y que el día se sienta menos pesado.</p>
             <p>Cuando quieras, me dices hora. Yo acomodo el resto.</p>`
          : `<h2>Recomendación aceptada</h2>
             <p>${nombre}, no hay minuta. No hay consejo no pedido. Solo hablar suave un rato.</p>
             <p>Cuando quieras, escribes. Yo ya estoy en “disponible”.</p>`;
    };
  }
  bindLater(out);
});
