import * as THREE from "three";
import { hillY } from "./world.js";

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function hashHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (h % 360) / 360;
}

export function createDog({ name, x = 0.4, z = 1.1 }) {
  const root = new THREE.Group();
  root.name = "pet";
  root.position.set(x, hillY(x, z), z);
  root.userData.name = name;
  root.userData.kind = "pet";
  root.userData.walking = false;
  root.userData.walkPhase = 0;

  const fur = new THREE.Color().setHSL(hashHue(name), 0.35, 0.38);
  const furM = new THREE.MeshStandardMaterial({ color: fur, roughness: 0.78 });
  const dark = new THREE.MeshStandardMaterial({ color: fur.clone().offsetHSL(0, 0, -0.15), roughness: 0.8 });
  const noseM = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), furM);
  body.scale.set(1.35, 0.85, 0.8);
  body.position.set(0, 0.28, 0);
  body.castShadow = true;
  root.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), furM);
  chest.position.set(0, 0.26, 0.16);
  root.add(chest);

  const head = new THREE.Group();
  head.position.set(0, 0.4, 0.28);
  root.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), furM);
  skull.castShadow = true;
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), furM);
  snout.scale.set(0.85, 0.7, 1.15);
  snout.position.set(0, -0.02, 0.12);
  head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), noseM);
  nose.position.set(0, 0, 0.2);
  head.add(nose);
  const mouth = new THREE.Group();
  mouth.position.set(0, -0.04, 0.18);
  head.add(mouth);
  [-0.04, 0.04].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), noseM);
    eye.position.set(ex, 0.04, 0.1);
    head.add(eye);
  });
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), dark);
    ear.scale.set(0.7, 1.15, 0.45);
    ear.position.set(s * 0.1, 0.1, -0.02);
    ear.rotation.z = s * 0.35;
    head.add(ear);
  });

  const tail = new THREE.Group();
  tail.position.set(0, 0.32, -0.18);
  const tailM = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.22, 6), furM);
  tailM.position.y = 0.1;
  tailM.rotation.x = 0.7;
  tail.add(tailM);
  root.add(tail);

  const legs = [];
  [
    [-0.08, 0.1],
    [0.08, 0.1],
    [-0.08, -0.1],
    [0.08, -0.1],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.2, lz);
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 0.2, 6), dark);
    bone.position.y = -0.1;
    leg.add(bone);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), dark);
    paw.position.set(0, -0.2, 0.01);
    paw.scale.set(1, 0.6, 1.2);
    leg.add(paw);
    root.add(leg);
    legs.push(leg);
  });

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 8, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.28;
  hit.name = "pet";
  root.add(hit);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.018, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xb33a3a, roughness: 0.45 })
  );
  collar.position.set(0, 0.34, 0.22);
  collar.rotation.x = 1.2;
  root.add(collar);

  root.userData.head = head;
  root.userData.body = body;
  root.userData.tail = tail;
  root.userData.legs = legs;
  root.userData.mouth = mouth;
  return root;
}

export function tickDog(d, t, dt) {
  const u = d.userData;
  u.tail.rotation.z = Math.sin(t * 8 + u.head.id) * 0.55;
  u.tail.rotation.x = 0.15 + Math.sin(t * 3) * 0.08;
  u.head.rotation.y = Math.sin(t * 0.7) * 0.2;
  if (u.walking) {
    u.walkPhase += dt * 12;
    const a = Math.sin(u.walkPhase) * 0.55;
    u.legs[0].rotation.x = a;
    u.legs[3].rotation.x = a;
    u.legs[1].rotation.x = -a;
    u.legs[2].rotation.x = -a;
    d.position.y = hillY(d.position.x, d.position.z) + Math.abs(Math.sin(u.walkPhase)) * 0.03;
    return;
  }
  u.legs.forEach((leg) => {
    leg.rotation.x *= 0.8;
  });
  d.position.y = hillY(d.position.x, d.position.z) + Math.sin(t * 2.2) * 0.008;
}

export function walkDog(d, dest, gsap) {
  if (d.userData.walkTween) d.userData.walkTween.kill();
  const goal = dest.clone();
  goal.y = hillY(goal.x, goal.z);
  const dist = d.position.distanceTo(goal);
  const duration = Math.max(0.55, Math.min(2, dist * 0.38));
  d.userData.walking = true;
  const angle = Math.atan2(goal.x - d.position.x, goal.z - d.position.z);
  const tw = gsap.to(d.position, {
    x: goal.x,
    z: goal.z,
    duration,
    ease: "sine.inOut",
    onUpdate() {
      d.position.y = hillY(d.position.x, d.position.z);
      d.rotation.y = lerpAngle(d.rotation.y, angle, 0.18);
    },
    onComplete() {
      d.userData.walking = false;
      d.userData.walkTween = null;
      d.rotation.y = angle;
    },
  });
  d.userData.walkTween = tw;
  return tw;
}
