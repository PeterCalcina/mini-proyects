export const APPLE_NOTES = [
  "¡Un regalo para ti! 🍎",
  "Dato: las manzanas flotan. Un cuarto de ellas es aire.",
  "Esta sabe a atardecer, no a súper.",
  "La guardé en la rama de adelante. Para que se vea.",
  "Un detalle chiquito. Como los que importan.",
  "Si el día estuvo raro, esto cuenta como respiro.",
];

export const PETER_HELLO = "Hola, soy Peter. Dato random: este cielo ya se apagó. Lo que ves es luz tardía.";

export const PETER_FACTS = [
  "Dato random: los atardeceres rojos son polvo. Y un poco de teatro.",
  "Las abejas distinguen el ultravioleta. Nosotros distinguimos si hay banca libre.",
  "Un perro entiende unas 165 palabras. La más importante es paseo.",
  "La Tierra está más lejos del Sol en julio. El calor es otra conversación.",
  "Las manzanas son de la familia de las rosas. Tiene sentido que se luzcan.",
  "El pasto crece más rápido de noche. Por eso de día solo finge que descansa.",
  "Los luciérnagas no calientan. Toda esa luz es show, cero lumbre.",
  "Si miras el sol ya oculto, estás viendo el pasado por ocho minutos.",
  "Los cuervos recuerdan caras. Yo apenas recuerdo dónde dejé la otra manzana.",
  "El viento no hace ruido. Choca con cosas y ellas se quejan.",
  "Una banca al atardecer baja el pulso. Está estudiado. O lo acabo de decidir.",
  "Los perros tienen el olfato mil veces más fino. Por eso llegan antes a la merienda.",
  "Las nubes de ahora pesan toneladas. Flotan porque son soberbias y huecas.",
  "Dato: bostezar es contagioso hasta en los chimpancés. Cuidado con pensarlo.",
  "El color violeta del cielo de arriba es Rayleigh. Abajo es naranja de novela.",
  "Las hojas caen de lado porque así viajan más. Pereza con título universitario.",
  "Si una mascota se sienta a tu lado, el cerro ya cumplió su trabajo.",
  "Los árboles se hablan por las raíces. Nosotros, con suerte, por una frase.",
];

export const MEN_LINES = [
  "Si esto fuera un partido, el cielo ya va ganando 3-0.",
  "Después de esto, un asado. El cerro no cobra cubierto.",
  "Dato de hombre inútil: el sol ya se fue. Estamos aplaudiendo un eco.",
  "La banca aguanta dos. Como un buen banco de suplentes, pero con vista.",
  "Si hay palo y perro, hay plan. El resto es conversación de vestuario.",
];

export const WOMEN_LINES = [
  "Este naranja parece pintado. Casi no quiero tocar el aire.",
  "Me quedaría acá hasta que el cielo se quede sin color.",
  "Hay un olor a pasto y a tarde que no se puede explicar bien.",
  "Si esto fuera una postal, no le pondría texto. Sobraría.",
  "El viento se porta bien hoy. Como si también se hubiera sentado.",
];

export const DEAR_LINES = [
  "Qué raro. Estar acá se siente más quieto que el silencio.",
  "No hace falta llenar el rato. Ya está lleno.",
  "Si te quedas un poco más, el cielo también.",
  "Me gusta este lado. El tuyo.",
  "Habla bajo. El atardecer está escuchando.",
];

export const BENCH_LINE = "Me encanta esta vista... ¿te sientas conmigo?";

export const COMPANY = {
  peter: "Encantado de tu compañía. En serio. El cerro se porta mejor con vos acá.",
  dear: "Yo también. Quédate. El resto puede esperar.",
};

export const PET_LINES = [
  (n) => `${n} mueve la cola. Traducción: el cerro le gusta.`,
  (n) => `${n} huele el pasto como si hubiera un secreto. Quizá lo hay.`,
  (n) => `${n} ya eligió a quién seguir. Spoiler: a ti no, al que tiene manzanas.`,
  (n) => `Si ${n} se acuesta, la tarde está oficialmente bien.`,
];

export const FETCH_LINES = [
  (n) => `${n} lo trajo. Casi sin negociar.`,
  (n) => `${n} entiende “traé”. El resto es decoración.`,
  (n) => `Lo dejó a los pies. Como quien devuelve un favor chiquito.`,
];

export function normGender(raw) {
  const t = String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/^f\b|fem|mujer|nena|chica|girl/.test(t)) return "f";
  if (/^m\b|masc|hombre|chico|varon|boy|guy/.test(t)) return "m";
  return "m";
}

export function isDear(name) {
  return /^(violeta|brisa)$/i.test(String(name || "").trim());
}

function asWho(p) {
  if (typeof p === "string") {
    const name = p;
    return {
      name,
      gender: isDear(name) || /a$/i.test(name) ? "f" : "m",
      host: /peter/i.test(name),
    };
  }
  if (p?.userData) {
    return { name: p.userData.name, gender: p.userData.gender, host: !!p.userData.host };
  }
  return { name: p.name, gender: p.gender || "m", host: !!p.host };
}

export function linesFor(person) {
  const w = asWho(person);
  if (w.host) return PETER_FACTS;
  if (isDear(w.name)) return DEAR_LINES;
  return w.gender === "f" ? WOMEN_LINES : MEN_LINES;
}

const MEN_TALK = [
  [(a, b) => `${b}, ¿el cielo o el partido? Yo ya elegí.`, (a, b) => `El cielo, ${a}. El partido no tiene esta luz.`, (a, b) => `Dato: si no hay asado después, igual cuenta como buena fecha.`, (a, b) => `Hay palo por ahí. Si hay perro, hay entretenimiento de hombres serios.`],
  [(a, b) => `${b}, esta banca es mejor que cualquier tribuna.`, (a, b) => `Y no cobra entrada, ${a}. Raro y justo.`, (a, b) => `Si el sol se va, que se vaya. Nosotros ya estamos sentados.`, (a, b) => `Después hablamos de trabajo. O no. Mejor no.`],
];

const WOMEN_TALK = [
  [(a, b) => `${b}, este color parece de otro día.`, (a, b) => `Sí, ${a}. Como si alguien hubiera bajado el volumen al mundo.`, (a, b) => `Me quedaría hasta que no quede naranja.`, (a, b) => `El viento se siente amable. Casi educado.`],
  [(a, b) => `${b}, ¿también viniste por esta luz o por no estar en casa?`, (a, b) => `Por las dos, ${a}. Y porque el cerro no pide explicaciones.`, (a, b) => `Si esto fuera una foto, no le pondría filtro.`, (a, b) => `Hablemos bajo. Da la sensación de que el cielo escucha.`],
];

const DEAR_TALK = (p, v) => [
  { name: p, text: `${v}. Qué bueno que hayas venido. De verdad.` },
  { name: v, text: `Peter. Este rato se siente más quieto contigo.` },
  { name: p, text: `No hace falta llenarlo de datos. Aunque me cuestan las manos quietas.` },
  { name: v, text: `Déjalos. Quédate. El cielo ya está haciendo el resto.` },
  { name: p, text: `Encantado de tu compañía. En serio.` },
  { name: v, text: `Yo también. Un rato más.` },
];

export function conversation(a, b) {
  const A = asWho(a);
  const B = asWho(b);
  if ((A.host || /peter/i.test(A.name)) && isDear(B.name)) return DEAR_TALK(A.name, B.name);
  if ((B.host || /peter/i.test(B.name)) && isDear(A.name)) return DEAR_TALK(B.name, A.name);

  const pick = (pack) => pack[Math.floor(Math.random() * pack.length)];
  if (A.gender === "m" && B.gender === "m") {
    const t = pick(MEN_TALK);
    return t.map((fn, i) => ({ name: i % 2 === 0 ? A.name : B.name, text: fn(A.name, B.name) }));
  }
  if (A.gender === "f" && B.gender === "f") {
    const t = pick(WOMEN_TALK);
    return t.map((fn, i) => ({ name: i % 2 === 0 ? A.name : B.name, text: fn(A.name, B.name) }));
  }
  const men = A.gender === "m" ? A : B;
  const women = A.gender === "f" ? A : B;
  return [
    { name: men.name, text: pick(MEN_TALK)[0](men.name, women.name) },
    { name: women.name, text: pick(WOMEN_TALK)[0](women.name, men.name) },
    { name: men.name, text: pick(MEN_TALK)[2](men.name, women.name) },
    { name: women.name, text: pick(WOMEN_TALK)[2](women.name, men.name) },
  ];
}

export function sitTogetherLine(people) {
  const peter = people.find((p) => p.userData.host);
  const dear = people.find((p) => isDear(p.userData.name));
  if (!peter || !dear) return null;
  if (peter.userData.seat !== "bench" || dear.userData.seat !== "bench") return null;
  return { whoP: peter, whoD: dear, lineP: COMPANY.peter, lineD: COMPANY.dear };
}
