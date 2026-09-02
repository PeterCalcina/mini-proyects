const qs = new URLSearchParams(location.search);

function pickName() {
  const raw = qs.get("nombre");
  if (raw) return raw.split(",")[0].trim();
  return "Violeta";
}

function fill(s) {
  return String(s).replaceAll("{nombre}", nombre);
}

const nombre = pickName();
document.getElementById("back").href += `?nombre=${encodeURIComponent(nombre)}`;
const album = window.ALBUM || { titulo: "Playlist", tracks: [] };

document.getElementById("coverTitle").textContent = fill(album.titulo);

const list = document.getElementById("list");
album.tracks.forEach((t, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<button type="button" data-i="${i}">
    <span class="n">${String(i + 1).padStart(2, "0")}</span>
    <span><strong>${fill(t.titulo)}</strong><small>${fill(t.artista)}</small></span>
  </button>`;
  list.appendChild(li);
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const t = album.tracks[Number(btn.dataset.i)];
  list.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  document.getElementById("trackTitle").textContent = fill(t.titulo);
  document.getElementById("trackArtist").textContent = fill(t.artista);
  document.getElementById("note").textContent = fill(t.nota);
  document.getElementById("vinyl").classList.add("on");
  if (t.url) window.open(t.url, "_blank", "noopener");
});
