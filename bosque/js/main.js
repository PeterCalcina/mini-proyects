import { createWorld, tickWorld } from "./world.js";
import { createPerson, tickPerson } from "./person.js";
import { tickDog } from "./pet.js";
import {
  createFireflies,
  tickFireflies,
  createLeaves,
  tickLeaves,
  createBirds,
  tickBirds,
  tickSparkles,
} from "./fx.js";
import { createInteract } from "./interact.js";
import { createAmbience } from "./audio.js";

const canvas = document.getElementById("stage");
const noteEl = document.getElementById("note");
const world = createWorld(canvas);

const people = [
  createPerson({ name: "Peter", gender: "m", host: true }),
];
world.scene.add(people[0]);
const pets = [];

const fireflies = createFireflies();
world.scene.add(fireflies);
const leaves = createLeaves(world.tree);
const birds = createBirds();
world.scene.add(birds);

const interact = createInteract({
  world,
  people,
  pets,
  gsap,
  noteEl,
});
const audio = createAmbience();
const btnAudio = document.getElementById("btn-audio");
btnAudio.textContent = "Sonido: on";
const unlock = () => audio.unlock();
canvas.addEventListener("pointerdown", unlock, { once: true });

document.getElementById("btn-view").addEventListener("click", () => interact.nextView());
btnAudio.addEventListener("click", async (e) => {
  const on = await audio.toggle();
  e.currentTarget.textContent = on ? "Sonido: on" : "Sonido de ambiente";
});

const sheet = document.getElementById("sheet");
const formPerson = document.getElementById("form-person");
const formPet = document.getElementById("form-pet");

function openSheet(which) {
  sheet.hidden = false;
  formPerson.hidden = which !== "person";
  formPet.hidden = which !== "pet";
  const first = sheet.querySelector("form:not([hidden]) input");
  first?.focus();
}
function closeSheet() {
  sheet.hidden = true;
}

document.getElementById("btn-person").addEventListener("click", () => openSheet("person"));
document.getElementById("btn-pet").addEventListener("click", () => openSheet("pet"));
sheet.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", closeSheet));

formPerson.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(formPerson);
  interact.addPerson(fd.get("nombre"), fd.get("genero"));
  formPerson.reset();
  formPerson.querySelector('input[name="genero"][value="f"]').checked = true;
  closeSheet();
});
formPet.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(formPet);
  interact.addPet(fd.get("nombre"));
  formPet.reset();
  closeSheet();
});

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  world.controls.update();
  tickWorld(world, t);
  people.forEach((p) => tickPerson(p, t, dt));
  pets.forEach((d) => tickDog(d, t, dt));
  tickFireflies(fireflies, t, interact.pointer);
  tickLeaves(leaves, dt);
  tickBirds(birds, t, dt);
  tickSparkles(interact.sparkles, dt);
  interact.tick(t, dt);
  audio.tick(dt);
  world.renderer.render(world.scene, world.camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener("resize", () => {
  world.camera.aspect = innerWidth / innerHeight;
  world.camera.updateProjectionMatrix();
  world.renderer.setSize(innerWidth, innerHeight);
});
