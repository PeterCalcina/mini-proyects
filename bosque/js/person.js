import * as THREE from "three";
import { hillY } from "./world.js";
import { normGender } from "./phrases.js";

function hashHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (h % 360) / 360;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export { normGender };

export function createPerson({ name, gender, host = false, x = -1.15, z = 0.35 }) {
  const g = normGender(gender);
  const root = new THREE.Group();
  root.name = "person";
  const start = new THREE.Vector3(x, hillY(x, z), z);
  root.position.copy(start);
  root.userData.home = start.clone();
  root.userData.name = name;
  root.userData.gender = g;
  root.userData.host = host;
  root.userData.kind = "person";
  root.rotation.y = host ? -0.9 : 0.4;

  const skin = new THREE.MeshStandardMaterial({ color: 0xf2c7a0, roughness: 0.65 });
  const hue = host ? 0.04 : hashHue(name);
  const shirtC = host ? 0xc45c3a : new THREE.Color().setHSL(hue, 0.48, 0.42).getHex();
  const pantsC = host ? 0x2c3a4a : new THREE.Color().setHSL(hue, 0.25, 0.22).getHex();
  const hairC = g === "f" ? 0x4a2c6a : 0x3a2418;
  const shirt = new THREE.MeshStandardMaterial({ color: shirtC, roughness: 0.58 });
  const pants = new THREE.MeshStandardMaterial({ color: g === "f" && !host ? shirtC : pantsC, roughness: 0.7 });
  const hairM = new THREE.MeshStandardMaterial({ color: hairC, roughness: 0.72 });
  const shoeM = new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.85 });

  const body = new THREE.Group();
  body.position.y = 1.02;
  root.add(body);

  if (g === "f") {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.4, 10), shirt);
    torso.castShadow = true;
    body.add(torso);
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.48, 12), shirt);
    skirt.position.y = -0.38;
    skirt.castShadow = true;
    body.add(skirt);
  } else {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.44, 10), shirt);
    torso.castShadow = true;
    body.add(torso);
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.08, 10), shirt);
    hem.position.y = -0.24;
    body.add(hem);
  }

  const head = new THREE.Group();
  head.position.y = 0.4;
  body.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.195, 16, 14), skin);
  skull.castShadow = true;
  skull.name = "person-head";
  head.add(skull);
  [-0.055, 0.055].forEach((ex) => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.4 })
    );
    eye.position.set(ex, 0.02, 0.175);
    head.add(eye);
  });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), skin);
  nose.position.set(0, -0.02, 0.18);
  nose.scale.set(0.7, 0.8, 1);
  head.add(nose);

  if (g === "f") {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), hairM);
    hair.scale.set(1.08, 0.88, 1);
    hair.position.set(0, 0.08, -0.03);
    head.add(hair);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), hairM);
    bun.position.set(0, 0.2, -0.14);
    head.add(bun);
    const bang = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), hairM);
    bang.scale.set(1.4, 0.42, 0.65);
    bang.position.set(0, 0.1, 0.12);
    head.add(bang);
    const fall = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), hairM);
    fall.position.set(0, -0.08, -0.14);
    head.add(fall);
  } else {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), hairM);
    hair.scale.set(1.02, 0.62, 1);
    hair.position.set(0, 0.1, -0.01);
    head.add(hair);
    const side = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), hairM);
    side.scale.set(1.8, 0.7, 0.9);
    side.position.set(0, 0.02, -0.02);
    head.add(side);
  }

  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (g === "f" ? 0.2 : 0.23), 0.12, 0);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 7), shirt);
    sleeve.position.y = -0.08;
    pivot.add(sleeve);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.28, 7), skin);
    arm.position.y = -0.28;
    arm.castShadow = true;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skin);
    hand.position.y = -0.43;
    pivot.add(hand);
    if (side > 0) {
      const hold = new THREE.Group();
      hold.position.set(0.02, -0.44, 0.04);
      pivot.add(hold);
      pivot.userData.hold = hold;
    }
    pivot.rotation.z = side * 0.18;
    body.add(pivot);
    return pivot;
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  function makeLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.08, 0.62, 0.02);
    const cloth = g === "f" ? skin : pants;
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.28, 7), cloth);
    thigh.position.y = -0.14;
    thigh.castShadow = true;
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.28;
    hip.add(knee);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.26, 7), cloth);
    shin.position.y = -0.13;
    shin.castShadow = true;
    knee.add(shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.12), shoeM);
    shoe.position.set(0, -0.28, 0.03);
    knee.add(shoe);
    root.add(hip);
    return { hip, knee };
  }
  const left = makeLeg(-1);
  const right = makeLeg(1);

  const hit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.75, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.88;
  hit.name = "person";
  root.add(hit);

  root.userData.head = head;
  root.userData.body = body;
  root.userData.armL = armL;
  root.userData.armR = armR;
  root.userData.hold = armR.userData.hold;
  root.userData.legL = left.hip;
  root.userData.legR = right.hip;
  root.userData.kneeL = left.knee;
  root.userData.kneeR = right.knee;
  root.userData.sitting = false;
  root.userData.walking = false;
  root.userData.walkPhase = 0;
  root.userData.lookCam = false;
  return root;
}

export function tickPerson(p, t, dt) {
  const u = p.userData;
  if (u.walking) {
    u.walkPhase += dt * 9.2;
    const swing = Math.sin(u.walkPhase) * 0.55;
    u.legL.rotation.x = swing;
    u.legR.rotation.x = -swing;
    u.kneeL.rotation.x = Math.max(0, -swing) * 0.75;
    u.kneeR.rotation.x = Math.max(0, swing) * 0.75;
    u.armL.rotation.x = -swing * 0.65;
    u.armR.rotation.x = swing * 0.65;
    u.body.position.y = 1.02 + Math.abs(Math.sin(u.walkPhase)) * 0.035;
    return;
  }
  if (u.sitting) {
    u.body.scale.y = 1 + Math.sin(t * 1.1 + u.home.x) * 0.008;
    return;
  }
  u.legL.rotation.x *= 0.82;
  u.legR.rotation.x *= 0.82;
  u.kneeL.rotation.x *= 0.82;
  u.kneeR.rotation.x *= 0.82;
  u.armL.rotation.x *= 0.82;
  u.armR.rotation.x *= 0.82;
  const breathe = 1 + Math.sin(t * 1.25 + u.home.x) * 0.012 + Math.sin(t * 0.37) * 0.005;
  u.body.scale.y = breathe;
  u.body.position.y = 1.02;
  p.position.y = hillY(p.position.x, p.position.z) + Math.sin(t * 1.25 + u.home.z) * 0.01;
  u.body.rotation.z = Math.sin(t * 0.55 + u.home.x) * 0.025;
  if (!u.lookCam && !u.talking) {
    u.head.rotation.y = Math.sin(t * 0.35 + u.home.x) * 0.18;
    u.head.rotation.x = Math.sin(t * 0.22) * 0.04;
  }
}

export function faceCamera(p, camera) {
  const head = p.userData.head;
  const target = camera.position.clone();
  head.lookAt(target);
  head.rotation.x *= 0.32;
  head.rotation.z = 0;
}

export function faceToward(p, other) {
  const dx = other.position.x - p.position.x;
  const dz = other.position.z - p.position.z;
  p.rotation.y = Math.atan2(dx, dz);
}

export function standUp(p) {
  p.userData.sitting = false;
  p.userData.seat = null;
  p.userData.seatSlot = null;
  p.userData.body.rotation.x = 0;
  p.userData.body.position.y = 1.02;
  p.userData.legL.rotation.x = 0;
  p.userData.legR.rotation.x = 0;
  p.userData.kneeL.rotation.x = 0;
  p.userData.kneeR.rotation.x = 0;
  p.userData.armL.rotation.x = 0;
  p.userData.armR.rotation.x = 0;
}

export function walkTo(p, dest, gsap) {
  if (p.userData.walkTween) p.userData.walkTween.kill();
  standUp(p);
  const goal = dest.clone();
  goal.y = hillY(goal.x, goal.z);
  const dist = p.position.distanceTo(goal);
  const duration = Math.max(0.55, Math.min(2.4, dist * 0.42));
  p.userData.walking = true;
  const angle = Math.atan2(goal.x - p.position.x, goal.z - p.position.z);
  const tw = gsap.to(p.position, {
    x: goal.x,
    z: goal.z,
    duration,
    ease: "sine.inOut",
    onUpdate() {
      p.position.y = hillY(p.position.x, p.position.z);
      p.rotation.y = lerpAngle(p.rotation.y, angle, 0.14);
    },
    onComplete() {
      p.userData.walking = false;
      p.userData.walkTween = null;
      p.rotation.y = angle;
      p.position.y = goal.y;
    },
  });
  p.userData.walkTween = tw;
  return tw;
}

export async function takeSeat(p, bench, gsap, { kind = "bench", slot = 0 } = {}) {
  if (p.userData.sitting) return;
  if (p.userData.walkTween) p.userData.walkTween.kill();
  bench.updateMatrixWorld();
  const lx = kind === "bench" ? (slot === 0 ? -0.32 : 0.32) : -0.85 + slot * 0.55;
  const lz = kind === "bench" ? 0.72 : 1.2;
  const front = bench.localToWorld(new THREE.Vector3(lx, 0, lz));
  front.y = hillY(front.x, front.z);
  await walkTo(p, front, gsap);

  let dest;
  if (kind === "bench") {
    dest = bench.localToWorld(new THREE.Vector3(lx, 0.448, 0.06));
    dest.y -= 0.63;
  } else {
    dest = front.clone();
    dest.y = hillY(front.x, front.z) - 0.28;
  }

  p.userData.walking = false;
  p.userData.sitting = true;
  p.userData.seat = kind;
  p.userData.seatSlot = slot;
  const u = p.userData;
  const tl = gsap.timeline();
  p.userData.walkTween = tl;
  await tl
    .to(p.rotation, { y: bench.rotation.y, duration: 0.4, ease: "sine.inOut" })
    .to(p.position, { x: dest.x, y: dest.y, z: dest.z, duration: 0.5, ease: "sine.inOut" }, "<")
    .to(u.body.rotation, { x: kind === "bench" ? 0.18 : 0.28, duration: 0.4, ease: "sine.out" }, "<")
    .to(u.body.position, { y: 0.93, duration: 0.4, ease: "sine.out" }, "<")
    .to(u.legL.rotation, { x: -1.22, duration: 0.45, ease: "sine.out" }, "<")
    .to(u.legR.rotation, { x: -1.18, duration: 0.45, ease: "sine.out" }, "<")
    .to(u.kneeL.rotation, { x: 1.22, duration: 0.45, ease: "sine.out" }, "<")
    .to(u.kneeR.rotation, { x: 1.18, duration: 0.45, ease: "sine.out" }, "<")
    .to(u.armL.rotation, { x: 0.72, duration: 0.35, ease: "sine.out" }, "<")
    .to(u.armR.rotation, { x: kind === "bench" ? 0.58 : 0.4, duration: 0.35, ease: "sine.out" }, "<");
  p.userData.walkTween = null;
}

export function sitOnBench(p, bench, gsap) {
  return takeSeat(p, bench, gsap, { kind: "bench", slot: 0 });
}
