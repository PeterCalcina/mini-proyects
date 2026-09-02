export function createAmbience() {
  let ctx = null;
  let nodes = [];
  let on = true;
  let chirpTimer = 0;

  function ensure() {
    if (ctx) return ctx;
    ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const wind = ctx.createGain();
    wind.gain.value = 0.35;
    noise.connect(filter);
    filter.connect(wind);
    wind.connect(master);
    noise.start();
    nodes = [master, wind];
    return ctx;
  }

  function chirp() {
    if (!ctx || ctx.state !== "running") return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const f = 1400 + Math.random() * 900;
    o.frequency.setValueAtTime(f, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f * 0.7, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.connect(g);
    g.connect(nodes[0]);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  }

  return {
    get enabled() {
      return on;
    },
    async unlock() {
      ensure();
      if (ctx.state === "suspended") await ctx.resume();
      if (on) nodes[0].gain.setTargetAtTime(0.22, ctx.currentTime, 0.06);
      return on;
    },
    async toggle() {
      ensure();
      if (ctx.state === "suspended") await ctx.resume();
      on = !on;
      nodes[0].gain.setTargetAtTime(on ? 0.22 : 0, ctx.currentTime, 0.08);
      return on;
    },
    tick(dt) {
      if (!on) return;
      chirpTimer -= dt;
      if (chirpTimer <= 0) {
        chirp();
        chirpTimer = 2.4 + Math.random() * 3.5;
      }
    },
  };
}
