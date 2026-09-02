import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const HILL = { a: 16, b: 4.8, cy: -1.2 };

export function hillY(x, z) {
  const t = (x * x + z * z) / (HILL.a * HILL.a);
  if (t >= 0.98) return HILL.cy;
  return HILL.cy + HILL.b * Math.sqrt(1 - t);
}

export function createWorld(canvas) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xc4785a, 0.024);
  scene.background = new THREE.Color(0x4a2048);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(8.2, 6.5, 12.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  controls.minDistance = 4;
  controls.maxDistance = 28;
  controls.minPolarAngle = 0.7;
  controls.maxPolarAngle = 1.35;
  controls.minAzimuthAngle = -0.95;
  controls.maxAzimuthAngle = 0.95;
  controls.target.set(0.4, 4.4, 0.6);
  controls.enablePan = false;

  const hemi = new THREE.HemisphereLight(0xffc9a0, 0x3a2048, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xff9a4a, 1.55);
  sun.position.set(-18, 10, -8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffb07a, 0.22));

  scene.add(makeSky());
  scene.add(makeHill());
  scene.add(makeGrass());
  scene.add(makeFlowers());
  scene.add(makeRocks());
  const tree = makeTree();
  scene.add(tree);
  const bench = makeBench();
  scene.add(bench);
  const clouds = makeClouds();
  scene.add(clouds);
  const toys = makeToys();
  toys.forEach((t) => scene.add(t));

  return { scene, camera, renderer, controls, sun, tree, bench, clouds, toys };
}

function makeSky() {
  const geo = new THREE.SphereGeometry(90, 32, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    fog: false,
    uniforms: {},
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vP;
      void main(){
        float h = normalize(vP).y;
        vec3 bottom = vec3(0.72, 0.22, 0.28);
        vec3 mid = vec3(0.95, 0.48, 0.28);
        vec3 top = vec3(0.28, 0.16, 0.42);
        vec3 col = mix(bottom, mid, smoothstep(-0.25, 0.18, h));
        col = mix(col, top, smoothstep(0.15, 0.72, h));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

function makeHill() {
  const geo = new THREE.SphereGeometry(1, 80, 56);
  geo.scale(HILL.a, HILL.b, HILL.a);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3a6236,
    roughness: 0.94,
    metalness: 0.02,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = HILL.cy;
  mesh.receiveShadow = true;
  mesh.name = "hill";
  return mesh;
}

function grassTexture() {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(16, 64, 16, 0);
  grd.addColorStop(0, "#2a4f26");
  grd.addColorStop(0.45, "#3f7a38");
  grd.addColorStop(1, "#8fce6a");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(16, 1);
  g.quadraticCurveTo(22, 22, 20, 64);
  g.lineTo(12, 64);
  g.quadraticCurveTo(10, 22, 16, 1);
  g.closePath();
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGrass() {
  const n = innerWidth < 700 ? 2200 : 4200;
  const blade = new THREE.PlaneGeometry(0.028, 0.1, 1, 2);
  blade.translate(0, 0.05, 0);
  const mat = new THREE.MeshStandardMaterial({
    map: grassTexture(),
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0,
    alphaTest: 0.35,
    side: THREE.DoubleSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float h = max(transformed.y, 0.0);
       vec3 wp = position;
       #ifdef USE_INSTANCING
         wp = (instanceMatrix * vec4(position, 1.0)).xyz;
       #endif
       float w = sin(uTime * 1.15 + wp.x * 2.4 + wp.z * 2.1) * 0.28 * h;
       transformed.x += w;`
    );
    mat.userData.shader = shader;
  };
  const mesh = new THREE.InstancedMesh(blade, mat, n);
  mesh.frustumCulled = false;
  mesh.userData.wind = mat;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let i = 0;
  let tries = 0;
  while (i < n && tries < n * 8) {
    tries += 1;
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * (HILL.a * 0.74);
    if (rad < 0.4) continue;
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    const y = hillY(x, z);
    dummy.position.set(x, y, z);
    dummy.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI, (Math.random() - 0.5) * 0.15);
    const s = 0.45 + Math.random() * 0.7;
    dummy.scale.set(0.7 + Math.random() * 0.5, s, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.setHSL(0.27 + Math.random() * 0.07, 0.42 + Math.random() * 0.28, 0.32 + Math.random() * 0.2);
    mesh.setColorAt(i, color);
    i += 1;
  }
  mesh.count = i;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

function makeFlowers() {
  const n = 90;
  const geo = new THREE.SphereGeometry(0.035, 6, 5);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const hues = [0.95, 0.08, 0.75, 0.12];
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 1.2 + Math.sqrt(Math.random()) * 8;
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    dummy.position.set(x, hillY(x, z) + 0.04, z);
    dummy.scale.setScalar(0.7 + Math.random() * 0.8);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.setHSL(hues[i % hues.length], 0.55, 0.55);
    mesh.setColorAt(i, color);
  }
  mesh.castShadow = false;
  return mesh;
}

function makeRocks() {
  const g = new THREE.Group();
  const spots = [
    [1.6, 2.15, 0.28],
    [3.1, 0.35, 0.2],
    [-2.4, 1.8, 0.22],
    [-1.3, -1.6, 0.18],
    [0.85, -1.9, 0.16],
  ];
  spots.forEach(([x, z, s]) => {
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(s, 0),
      new THREE.MeshStandardMaterial({ color: 0x6b5a4a, roughness: 0.95 })
    );
    rock.position.set(x, hillY(x, z) + s * 0.35, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1.2, 0.7, 1);
    rock.castShadow = true;
    rock.receiveShadow = true;
    g.add(rock);
  });
  return g;
}

function makeApple() {
  const apple = new THREE.Group();
  apple.name = "apple";
  const fruit = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 14, 12),
    new THREE.MeshStandardMaterial({
      color: 0xff2f22,
      roughness: 0.32,
      metalness: 0.12,
      emissive: 0xc01810,
      emissiveIntensity: 0.55,
    })
  );
  fruit.scale.set(1, 0.92, 1);
  fruit.castShadow = true;
  apple.add(fruit);
  const gloss = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xffe0c8, roughness: 0.15, transparent: true, opacity: 0.55 })
  );
  gloss.position.set(0.09, 0.1, 0.14);
  apple.add(gloss);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.1, 5),
    new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 0.9 })
  );
  stem.position.y = 0.28;
  stem.rotation.z = 0.2;
  apple.add(stem);
  const leaf = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 7),
    new THREE.MeshStandardMaterial({ color: 0x3d8a3a, side: THREE.DoubleSide, roughness: 0.8 })
  );
  leaf.position.set(0.07, 0.3, 0);
  leaf.rotation.set(-0.8, 0.4, 0.6);
  apple.add(leaf);
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 8, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  apple.add(hit);
  return apple;
}

function makeTree() {
  const root = new THREE.Group();
  root.name = "tree";
  root.position.set(0, hillY(0, 0), 0);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.92 });
  const barkDark = new THREE.MeshStandardMaterial({ color: 0x3d2616, roughness: 0.95 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.46, 2.7, 10), trunkMat);
  trunk.position.y = 1.35;
  trunk.castShadow = true;
  root.add(trunk);
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 1.5, 8), trunkMat);
  trunk2.position.set(0.18, 2.85, -0.08);
  trunk2.rotation.z = -0.28;
  trunk2.castShadow = true;
  root.add(trunk2);
  const trunk3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.15, 7), trunkMat);
  trunk3.position.set(-0.35, 3.15, 0.15);
  trunk3.rotation.z = 0.42;
  trunk3.castShadow = true;
  root.add(trunk3);

  [-0.35, 0.32, -0.05, 0.18].forEach((x, i) => {
    const rootBit = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.55, 6), barkDark);
    rootBit.position.set(x, 0.12, i % 2 ? 0.28 : -0.22);
    rootBit.rotation.z = x > 0 ? -1.05 : 1.05;
    rootBit.rotation.x = i % 2 ? 0.35 : -0.3;
    root.add(rootBit);
  });

  const leafCols = [0x245c2e, 0x2f7340, 0x1e4d28, 0x376b38];
  const canopy = new THREE.Group();
  canopy.position.y = 3.55;
  [
    [0, 0.1, 0, 1.28],
    [1.05, 0.12, 0.28, 0.92],
    [-0.95, 0.02, 0.38, 0.95],
    [0.15, 0.5, -0.85, 1.02],
    [0.38, 0.62, 0.72, 0.88],
    [-0.55, 0.4, -0.55, 0.9],
    [0.85, 0.35, -0.45, 0.78],
    [-0.2, 0.72, 0.15, 0.82],
  ].forEach(([x, y, z, s], i) => {
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(s, 1),
      new THREE.MeshStandardMaterial({ color: leafCols[i % 4], roughness: 0.78 })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    canopy.add(m);
  });
  root.add(canopy);

  const apples = [];
  const nestled = [
    { c: [0.38, 4.05, 0.72], r: 0.88, dir: [0.4, -0.85, 0.85] },
    { c: [1.05, 3.67, 0.28], r: 0.92, dir: [0.75, -0.7, 0.55] },
    { c: [0, 3.65, 0], r: 1.18, dir: [0.2, -0.9, 0.75] },
    { c: [-0.95, 3.57, 0.38], r: 0.95, dir: [-0.25, -0.8, 0.85] },
    { c: [0.85, 3.9, -0.45], r: 0.78, dir: [0.7, -0.75, 0.5] },
    { c: [-0.2, 4.27, 0.15], r: 0.82, dir: [0.2, -0.7, 0.9] },
    { c: [0.15, 4.05, -0.2], r: 0.95, dir: [0.35, -0.95, 0.7] },
    { c: [0.7, 3.7, 0.7], r: 0.8, dir: [0.5, -0.8, 0.8] },
  ];
  nestled.forEach((n, i) => {
    const dir = new THREE.Vector3(...n.dir).normalize();
    const applePos = new THREE.Vector3(...n.c).addScaledVector(dir, n.r * 1.08);
    const base = new THREE.Vector3(...n.c).addScaledVector(dir, n.r * 0.55);
    const len = base.distanceTo(applePos);
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.028, len, 5), trunkMat);
    wood.position.copy(base.clone().lerp(applePos, 0.5));
    wood.lookAt(applePos);
    wood.rotateX(-Math.PI / 2);
    wood.castShadow = true;
    root.add(wood);
    const apple = makeApple();
    apple.position.copy(applePos);
    apple.userData.index = i;
    apple.userData.home = apple.position.clone();
    apple.userData.gone = false;
    root.add(apple);
    apples.push(apple);
  });
  root.userData.apples = apples;

  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.86 })
  );
  basket.position.set(0.7, 0.1, 0.55);
  basket.castShadow = true;
  root.add(basket);
  return root;
}

function makeBench() {
  const g = new THREE.Group();
  g.name = "bench";
  const x = 2.35;
  const z = 1.55;
  const y = hillY(x, z);
  g.position.set(x, y, z);
  g.rotation.y = -0.55;
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.82 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.88 });

  [-0.14, 0, 0.14].forEach((lz) => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.05, 0.12), wood);
    slat.position.set(0, 0.44, lz);
    slat.castShadow = true;
    slat.receiveShadow = true;
    g.add(slat);
  });
  [-0.12, 0.08].forEach((ly) => {
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.1, 0.05), wood);
    back.position.set(0, 0.68 + ly, -0.22);
    back.castShadow = true;
    g.add(back);
  });
  [-0.55, 0.55].forEach((lx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), woodDark);
    post.position.set(lx, 0.25, 0.16);
    g.add(post);
    const post2 = post.clone();
    post2.position.z = -0.18;
    g.add(post2);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.38), woodDark);
    rail.position.set(lx, 0.18, 0);
    g.add(rail);
  });
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.03, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x6b2a44, roughness: 0.7 })
  );
  book.position.set(-0.35, 0.5, 0.02);
  book.rotation.y = 0.3;
  g.add(book);

  g.userData.sitLocal = new THREE.Vector3(0.12, 0.448, 0.06);
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.9, 0.7),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.45;
  hit.name = "bench";
  g.add(hit);
  return g;
}

function makeToys() {
  const stick = new THREE.Group();
  stick.name = "toy";
  stick.userData.kind = "stick";
  const wood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.024, 0.48, 6),
    new THREE.MeshStandardMaterial({ color: 0x6b4a28, roughness: 0.9 })
  );
  wood.rotation.z = 1.15;
  wood.castShadow = true;
  stick.add(wood);
  const stickHit = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  stick.add(stickHit);
  stick.position.set(1.15, hillY(1.15, 2.35) + 0.04, 2.35);

  const stone = new THREE.Group();
  stone.name = "toy";
  stone.userData.kind = "stone";
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09, 0),
    new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 0.95 })
  );
  rock.castShadow = true;
  stone.add(rock);
  const stoneHit = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  stone.add(stoneHit);
  stone.position.set(3.35, hillY(3.35, 0.75) + 0.07, 0.75);
  return [stick, stone];
}

function makeClouds() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffd4c0,
    transparent: true,
    opacity: 0.38,
    roughness: 1,
    depthWrite: false,
  });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Group();
    [1.8, 1.2, 1.4].forEach((s, k) => {
      const p = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 8), mat);
      p.scale.y = 0.45;
      p.position.x = (k - 1) * 1.3;
      c.add(p);
    });
    c.position.set(-18 + i * 9, 11 + (i % 2), -20 - (i % 3) * 3);
    c.userData.speed = 0.12 + i * 0.03;
    group.add(c);
  }
  return group;
}

export function tickWorld(world, t) {
  const wind = world.scene.children.find((c) => c.isInstancedMesh && c.userData.wind);
  if (wind?.userData.wind.userData.shader) {
    wind.userData.wind.userData.shader.uniforms.uTime.value = t;
  }
  world.clouds.children.forEach((c) => {
    c.position.x += c.userData.speed * 0.016;
    if (c.position.x > 28) c.position.x = -26;
  });
}
