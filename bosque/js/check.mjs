import { normGender, conversation, isDear } from "./phrases.js";

const fails = [];
if (normGender("Feminenio") !== "f") fails.push("feminenio");
if (normGender("femenino") !== "f") fails.push("femenino");
if (normGender("Masculino") !== "m") fails.push("masculino");
const talk = conversation("Peter", "Violeta");
if (talk.length < 4) fails.push("talk-length");
if (!talk.some((l) => /Violeta/.test(l.text) || l.name === "Violeta")) fails.push("talk-violeta");
if (!isDear("Brisa") || !isDear("Violeta")) fails.push("dear");
if (isDear("Pedro")) fails.push("dear-false");
if (fails.length) {
  console.error(fails.join(", "));
  process.exit(1);
}
console.log("ok");
