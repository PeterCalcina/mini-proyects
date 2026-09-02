import * as THREE from "three";
import { hillY } from "./world.js";
import { takeSeat, faceCamera, faceToward, walkTo, standUp, createPerson } from "./person.js";
import { createDog, walkDog } from "./pet.js";
import { burstSparkles } from "./fx.js";
import {
  APPLE_NOTES,
  PETER_HELLO,
  PETER_FACTS,
  BENCH_LINE,
  PET_LINES,
  FETCH_LINES,
  linesFor,
  conversation,
  sitTogetherLine,
  isDear,
} from "./phrases.js";

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

function attachHud(obj, cls) {
  const el = document.createElement("div");
  el.className = cls;
  document.body.appendChild(el);
  return el;
}

function project(obj3, el, lift = 0.35) {
  const v = new THREE.Vector3();
  obj3.getWorldPosition(v);
  v.y += lift;
  v.project(project._cam);
  el.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`;
  el.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
}

export function createInteract({ world, people, pets, gsap, noteEl }) {
  const { camera, renderer, controls, bench, tree, scene, toys } = world;
  project._cam = camera;
  let helloDone = false;
  let view = 0;
  let talkGen = 0;
  let talking = false;
  let lastAmbient = 4;
  const sparkles = [];
  let press = null;
  const lastGround = new THREE.Vector3(-1.2, 0, 0.85);
  const host = () => people.find((p) => p.userData.host) || people[0];
  let selected = host();

  people.forEach((p) => {
    p.userData.speech = attachHud(p, "speech");
    p.userData.tag = attachHud(p, "nametag");
    p.userData.tag.textContent = p.userData.name;
  });

  function pickables() {
    const live = tree.userData.apples.filter((a) => !a.userData.gone);
    return [...people, bench, ...live, ...pets, ...(toys || [])];
  }

  function sayFrom(who, text, ms = 4000) {
    const el = who.userData.speech;
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), ms);
  }

  function floatNote(text, worldPos) {
    noteEl.textContent = text;
    const v = worldPos.clone().project(camera);
    noteEl.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`;
    noteEl.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
    noteEl.classList.add("show");
    clearTimeout(floatNote._t);
    floatNote._t = setTimeout(() => noteEl.classList.remove("show"), 2800);
  }

  function dropApple(apple) {
    if (apple.userData.gone) return;
    apple.userData.gone = true;
    const start = new THREE.Vector3();
    apple.getWorldPosition(start);
    const who = host();
    who.userData.hold.updateMatrixWorld();
    const dest = new THREE.Vector3();
    who.userData.hold.getWorldPosition(dest);
    sparkles.push(burstSparkles(scene, start));
    floatNote(APPLE_NOTES[Math.floor(Math.random() * APPLE_NOTES.length)], start);
    if (!who.userData.sitting) {
      gsap.to(who.userData.armR.rotation, { x: -0.85, duration: 0.45, ease: "sine.out" });
    }

    const proxy = { y: start.y, x: start.x, z: start.z };
    gsap.to(proxy, { x: dest.x, z: dest.z, duration: 1.05, ease: "sine.in" });
    gsap.to(proxy, {
      y: dest.y,
      duration: 1.05,
      ease: "power2.in",
      onUpdate: () => {
        who.userData.hold.updateMatrixWorld();
        who.userData.hold.getWorldPosition(dest);
        apple.position.copy(tree.worldToLocal(new THREE.Vector3(proxy.x, proxy.y, proxy.z)));
      },
      onComplete: () => {
        who.userData.hold.updateMatrixWorld();
        apple.removeFromParent();
        who.userData.hold.add(apple);
        const n = who.userData.hold.children.length - 1;
        apple.position.set(0.03 * n, 0.02 * n, 0);
        apple.scale.setScalar(0.8);
        const dear = people.find((p) => isDear(p.userData.name));
        sayFrom(
          who,
          dear
            ? `La atrapé. Para el rato. Y un poco para ${dear.userData.name}.`
            : "La atrapé. Queda mejor en los brazos que en el pasto."
        );
      },
    });
  }

  function closeOn(person) {
    const p = person.position;
    gsap.to(camera.position, {
      x: p.x + 2.6,
      y: p.y + 2.1,
      z: p.z + 3.1,
      duration: 1.35,
      ease: "power3.inOut",
    });
    gsap.to(controls.target, {
      x: p.x,
      y: p.y + 1.55,
      z: p.z,
      duration: 1.35,
      ease: "power3.inOut",
    });
    view = 1;
  }

  function clampGround(x, z) {
    let nx = x;
    let nz = z;
    const r = Math.hypot(nx, nz);
    const max = 11.4;
    if (r > max) {
      nx *= max / r;
      nz *= max / r;
    }
    if (Math.hypot(nx, nz) < 0.7) {
      nx = 1.15;
      nz = 1.1;
    }
    lastGround.set(nx, 0, nz);
    return lastGround.clone();
  }

  function groundPoint(clientX, clientY) {
    pointerNdc.x = (clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hill = scene.getObjectByName("hill");
    if (!hill) return null;
    const hits = raycaster.intersectObject(hill, false);
    if (!hits.length) return null;
    return clampGround(hits[0].point.x, hits[0].point.z);
  }

  function onPerson(person) {
    selected = person;
    closeOn(person);
    person.userData.lookCam = true;
    if (person.userData.host && !helloDone) {
      helloDone = true;
      sayFrom(person, PETER_HELLO, 4800);
      return;
    }
    const pool = linesFor(person);
    sayFrom(person, pool[Math.floor(Math.random() * pool.length)]);
  }

  function onPet(pet) {
    const line = PET_LINES[Math.floor(Math.random() * PET_LINES.length)](pet.userData.name);
    sayFrom(pet, line, 3200);
  }

  function walkUp(obj, test) {
    let o = obj;
    while (o) {
      if (test(o)) return o;
      o = o.parent;
    }
    return null;
  }

  function hit(clientX, clientY) {
    pointerNdc.x = (clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(pickables(), true);
    if (hits.length) {
      const obj = hits[0].object;
      const apple = walkUp(obj, (o) => o.name === "apple");
      if (apple) {
        dropApple(apple);
        return;
      }
      const person = walkUp(obj, (o) => o.userData?.kind === "person");
      if (person) {
        onPerson(person);
        return;
      }
      const pet = walkUp(obj, (o) => o.userData?.kind === "pet");
      if (pet) {
        const held = (toys || []).find((t) => pet.userData.mouth?.children.includes(t));
        if (held) throwToy(held);
        else onPet(pet);
        return;
      }
      const toy = walkUp(obj, (o) => o.name === "toy");
      if (toy) {
        throwToy(toy);
        return;
      }
      if (walkUp(obj, (o) => o.name === "bench")) {
        seatEveryone();
        return;
      }
    }
    const dest = groundPoint(clientX, clientY);
    if (dest && selected) walkTo(selected, dest, gsap);
  }

  renderer.domElement.addEventListener("pointermove", (e) => {
    pointerNdc.x = (e.clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / innerHeight) * 2 + 1;
  });
  renderer.domElement.addEventListener("pointerdown", (e) => {
    press = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!press) return;
    const dx = e.clientX - press.x;
    const dy = e.clientY - press.y;
    press = null;
    if (dx * dx + dy * dy > 36) return;
    hit(e.clientX, e.clientY);
  });

  const views = () => {
    const h = host();
    return [
      { pos: [8.2, 6.5, 12.2], target: [0.4, 4.4, 0.6] },
      { pos: [h.position.x + 2.6, h.position.y + 2.1, h.position.z + 3.1], target: [h.position.x, h.position.y + 1.55, h.position.z] },
      { pos: [4.6, 3.6, 3.8], target: [2.1, 3.5, 1.4] },
    ];
  };

  function setView(i) {
    const list = views();
    view = i % list.length;
    const v = list[view];
    gsap.to(camera.position, { x: v.pos[0], y: v.pos[1], z: v.pos[2], duration: 1.4, ease: "power3.inOut" });
    gsap.to(controls.target, {
      x: v.target[0],
      y: v.target[1],
      z: v.target[2],
      duration: 1.4,
      ease: "power3.inOut",
    });
  }

  async function seatEveryone() {
    const waiting = people.filter((p) => !p.userData.sitting);
    if (!waiting.length) {
      const sweet = sitTogetherLine(people);
      if (sweet) sayFrom(sweet.whoP, sweet.lineP);
      return;
    }
    const used = new Set(
      people.filter((p) => p.userData.seat === "bench").map((p) => p.userData.seatSlot)
    );
    let groundSlot = people.filter((p) => p.userData.seat === "ground").length;
    const jobs = waiting.map((p) => {
      const free = [0, 1].find((s) => !used.has(s));
      if (free !== undefined) {
        used.add(free);
        return takeSeat(p, bench, gsap, { kind: "bench", slot: free });
      }
      const gSlot = groundSlot;
      groundSlot += 1;
      return takeSeat(p, bench, gsap, { kind: "ground", slot: gSlot });
    });
    await Promise.all(jobs);
    const sweet = sitTogetherLine(people);
    if (sweet) {
      sayFrom(sweet.whoP, sweet.lineP);
      setTimeout(() => sayFrom(sweet.whoD, sweet.lineD), 2400);
    } else {
      sayFrom(host(), BENCH_LINE);
    }
  }

  async function throwToy(toy) {
    if (toy.userData.busy) return;
    toy.userData.busy = true;
    toy.scale.setScalar(1);
    const dog = pets[0];
    const thrower = host();
    const w = new THREE.Vector3();
    toy.getWorldPosition(w);
    scene.add(toy);
    toy.position.copy(w);
    const dir = new THREE.Vector3(lastGround.x - thrower.position.x, 0, lastGround.z - thrower.position.z);
    if (dir.lengthSq() < 1) dir.set(2.2, 0, 3.4);
    dir.setLength(4.2);
    const dest = thrower.position.clone().add(dir);
    const r = Math.hypot(dest.x, dest.z);
    if (r > 11) {
      dest.x *= 11 / r;
      dest.z *= 11 / r;
    }
    dest.y = hillY(dest.x, dest.z) + 0.06;
    const peak = dest.y + 1.5;
    await Promise.all([
      gsap.to(toy.position, { x: dest.x, z: dest.z, duration: 0.75, ease: "sine.out" }),
      gsap.to(toy.position, { y: peak, duration: 0.38, ease: "sine.out" }).then(() =>
        gsap.to(toy.position, { y: dest.y, duration: 0.38, ease: "sine.in" })
      ),
    ]);
    if (!dog) {
      sayFrom(thrower, "Falta alguien con cola para que esto tenga sentido.");
      toy.userData.busy = false;
      return;
    }
    await walkDog(dog, dest, gsap);
    dog.userData.mouth.add(toy);
    toy.position.set(0, 0, 0.08);
    toy.scale.setScalar(0.7);
    const back = thrower.position.clone();
    back.x += 0.75;
    back.z += 0.45;
    back.y = hillY(back.x, back.z);
    await walkDog(dog, back, gsap);
    sayFrom(dog, FETCH_LINES[Math.floor(Math.random() * FETCH_LINES.length)](dog.userData.name));
    toy.userData.busy = false;
  }

  async function playTalk(a, b) {
    const id = ++talkGen;
    talking = true;
    a.userData.talking = true;
    b.userData.talking = true;
    faceToward(a, b);
    faceToward(b, a);
    const script = conversation(a.userData.name, b.userData.name);
    for (const line of script) {
      if (id !== talkGen) return;
      const who = line.name === a.userData.name ? a : b;
      sayFrom(who, line.text, 3100);
      await new Promise((r) => setTimeout(r, 3300));
    }
    if (id === talkGen) {
      talking = false;
      a.userData.talking = false;
      b.userData.talking = false;
    }
  }

  async function addPerson(nombre, genero) {
    const name = String(nombre || "").trim().slice(0, 20);
    if (!name) return;
    if (people.length >= 6) {
      sayFrom(host(), "El cerro ya está lleno. Que baje alguien o que siga el cielo.");
      return;
    }
    const used = people.filter((p) => !p.userData.host).length;
    const h = host();
    const dest = lastGround.clone();
    const guest = createPerson({
      name,
      gender: genero,
      x: -5.2,
      z: 2.4 + used * 0.15,
    });
    guest.userData.speech = attachHud(guest, "speech");
    guest.userData.tag = attachHud(guest, "nametag");
    guest.userData.tag.textContent = name;
    scene.add(guest);
    people.push(guest);
    selected = guest;
    standUp(h);
    const meetA = dest.clone();
    meetA.x += 0.55;
    const meetB = dest.clone();
    meetB.x -= 0.4;
    await Promise.all([walkTo(h, meetA, gsap), walkTo(guest, meetB, gsap)]);
    await playTalk(h, guest);
  }

  async function addPet(nombre) {
    const name = String(nombre || "").trim().slice(0, 18);
    if (!name) return;
    if (pets.length >= 4) {
      sayFrom(host(), "Ya hay cola de más. El pasto pide turno.");
      return;
    }
    const h = host();
    const dog = createDog({ name, x: -4.6, z: 2.8 });
    dog.userData.speech = attachHud(dog, "speech");
    dog.userData.tag = attachHud(dog, "nametag");
    dog.userData.tag.textContent = name;
    scene.add(dog);
    pets.push(dog);
    const dest = h.position.clone();
    dest.x += 0.75 + pets.length * 0.15;
    dest.z += 0.45;
    await walkDog(dog, dest, gsap);
    sayFrom(dog, `${name} ya eligió cerro. Y dueño, si se deja.`, 3200);
    sayFrom(h, `Dato random: ${name} acaba de subir el promedio de cola por metro cuadrado.`, 3400);
  }

  return {
    sparkles,
    pointer: pointerNdc,
    addPerson,
    addPet,
    nextView() {
      setView(view + 1);
    },
    tick(t, dt = 0.016) {
      people.forEach((p) => {
        project(p.userData.head, p.userData.speech, 0.42);
        project(p.userData.head, p.userData.tag, 0.28);
        if (view === 1 && p.userData.lookCam) faceCamera(p, camera);
      });
      pets.forEach((d) => {
        if (d.userData.speech) project(d.userData.head, d.userData.speech, 0.28);
        if (d.userData.tag) project(d.userData.head, d.userData.tag, 0.16);
      });
      if (!talking) {
        lastAmbient -= dt;
        const h = host();
        if (!helloDone && t > 8 && !h.userData.walking) {
          helloDone = true;
          sayFrom(h, PETER_HELLO, 4800);
          lastAmbient = 14;
        } else if (helloDone && lastAmbient <= 0 && !h.userData.walking) {
          lastAmbient = 15 + Math.random() * 8;
          sayFrom(h, PETER_FACTS[Math.floor(Math.random() * PETER_FACTS.length)], 3800);
        }
      }
    },
  };
}
