import * as THREE from "three";

export function createFireflies(n = 70) {
  const pos = new Float32Array(n * 3);
  const base = [];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 22;
    const z = (Math.random() - 0.5) * 22;
    const y = 1.5 + Math.random() * 6;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    base.push({ x, y, z, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.8 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffe08a,
    size: 0.09,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.base = base;
  return pts;
}

export function tickFireflies(pts, t, pointer) {
  const arr = pts.geometry.attributes.position.array;
  const base = pts.userData.base;
  for (let i = 0; i < base.length; i++) {
    const b = base[i];
    arr[i * 3] = b.x + Math.sin(t * b.s + b.p) * 0.55 + pointer.x * 0.8;
    arr[i * 3 + 1] = b.y + Math.sin(t * 0.7 + b.p) * 0.35;
    arr[i * 3 + 2] = b.z + Math.cos(t * b.s * 0.8 + b.p) * 0.55 + pointer.y * 0.5;
  }
  pts.geometry.attributes.position.needsUpdate = true;
}

export function createLeaves(tree, n = 36) {
  const geo = new THREE.PlaneGeometry(0.12, 0.16);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    side: THREE.DoubleSide,
    roughness: 1,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  const dummy = new THREE.Object3D();
  const bits = [];
  for (let i = 0; i < n; i++) {
    bits.push({
      x: (Math.random() - 0.5) * 2.4,
      y: 3.2 + Math.random() * 2.2,
      z: (Math.random() - 0.5) * 2.4,
      vy: 0.25 + Math.random() * 0.35,
      spin: Math.random() * Math.PI,
    });
    dummy.position.set(bits[i].x, bits[i].y, bits[i].z);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.userData.bits = bits;
  mesh.userData.dummy = dummy;
  tree.add(mesh);
  return mesh;
}

export function tickLeaves(mesh, dt) {
  const { bits, dummy } = mesh.userData;
  bits.forEach((b, i) => {
    b.y -= b.vy * dt * 0.72;
    b.x += Math.sin(b.spin + b.y * 2.4) * dt * 0.2;
    b.spin += dt * 1.35;
    if (b.y < 0.2) {
      b.y = 4.6;
      b.x = (Math.random() - 0.5) * 2.2;
      b.z = (Math.random() - 0.5) * 2.2;
    }
    dummy.position.set(b.x, b.y, b.z);
    dummy.rotation.set(b.spin, b.spin * 0.4, 0.3);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

export function createBirds() {
  const flock = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x2a1a18 });
  for (let i = 0; i < 3; i++) {
    const bird = new THREE.Group();
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.12), mat);
    const wing2 = wing.clone();
    wing.rotation.z = 0.4;
    wing2.rotation.z = -0.4;
    wing.position.x = 0.2;
    wing2.position.x = -0.2;
    bird.add(wing, wing2);
    bird.userData.wings = [wing, wing2];
    bird.userData.phase = i * 2.1;
    bird.position.set(-20, 10 + i, -12);
    flock.add(bird);
  }
  flock.userData.wait = 4;
  return flock;
}

export function tickBirds(flock, t, dt) {
  flock.userData.wait -= dt;
  flock.children.forEach((b, i) => {
    const flap = Math.sin(t * 7.2 + b.userData.phase) * 0.38;
    b.userData.wings[0].rotation.z = 0.35 + flap;
    b.userData.wings[1].rotation.z = -0.35 - flap;
    if (flock.userData.wait < 0) {
      b.position.x += (3.6 + i * 0.3) * dt;
      b.position.y += Math.sin(t * 2 + i) * dt * 0.4;
      if (b.position.x > 24) {
        b.position.x = -22;
        b.position.z = -10 - Math.random() * 8;
        flock.userData.wait = 6 + Math.random() * 8;
      }
    }
  });
}

export function burstSparkles(scene, origin) {
  const n = 18;
  const pos = new Float32Array(n * 3);
  const vel = [];
  for (let i = 0; i < n; i++) {
    pos[i * 3] = origin.x;
    pos[i * 3 + 1] = origin.y;
    pos[i * 3 + 2] = origin.z;
    vel.push(
      new THREE.Vector3((Math.random() - 0.5) * 2.2, 1.4 + Math.random() * 1.6, (Math.random() - 0.5) * 2.2)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xfff1b0,
      size: 0.08,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(pts);
  return { pts, vel, life: 0.9 };
}

export function tickSparkles(list, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i];
    s.life -= dt;
    const arr = s.pts.geometry.attributes.position.array;
    s.vel.forEach((v, k) => {
      v.y -= 3.2 * dt;
      arr[k * 3] += v.x * dt;
      arr[k * 3 + 1] += v.y * dt;
      arr[k * 3 + 2] += v.z * dt;
    });
    s.pts.geometry.attributes.position.needsUpdate = true;
    s.pts.material.opacity = Math.max(0, s.life);
    if (s.life <= 0) {
      s.pts.removeFromParent();
      s.pts.geometry.dispose();
      list.splice(i, 1);
    }
  }
}
