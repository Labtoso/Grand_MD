const STORAGE_KEY = "md_abmeldung_angaben";

const nameInput = document.getElementById("name");
const passInput = document.getElementById("passnummer");
const eintragenBtn = document.getElementById("eintragenBtn");
const austragenBtn = document.getElementById("austragenBtn");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");

let checkinTime = null;
let checkoutTime = null;
let copyBtnTimer = null;

function formatTime(date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function persist() {
  const name = nameInput.value.trim();
  const passnummer = passInput.value.trim();

  if (!name && !passnummer) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, passnummer }));
}

function ensureCheckin() {
  if (!checkinTime && (nameInput.value.trim() || passInput.value.trim())) {
    checkinTime = new Date();
  }
}

function render() {
  const name = nameInput.value.trim();
  const passnummer = passInput.value.trim();

  if (!name && !passnummer) {
    output.textContent = "Fülle die Felder aus, um deinen Text zu erhalten.";
    copyBtn.disabled = true;
    return;
  }

  copyBtn.disabled = false;

  const lines = [
    `Name: ${name || "—"}`,
    `Reisepassnummer: ${passnummer || "—"}`,
    `Eingetragen um: ${checkinTime ? formatTime(checkinTime) : ""}`,
    "",
    `Ausgetragen um: ${checkoutTime ? formatTime(checkoutTime) : ""}`,
  ];

  const text = lines.join("\n");
  output.textContent = checkoutTime ? `~~${text}~~` : text;
}

function handleInput() {
  ensureCheckin();
  persist();
  render();
}

function loadSaved() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (err) {
    data = null;
  }

  if (!data) return;

  if (data.name) nameInput.value = data.name;
  if (data.passnummer) passInput.value = data.passnummer;

  if (nameInput.value.trim() || passInput.value.trim()) {
    checkinTime = new Date();
  }
}

nameInput.addEventListener("input", handleInput);
passInput.addEventListener("input", handleInput);

eintragenBtn.addEventListener("click", () => {
  checkinTime = new Date();
  render();
});

austragenBtn.addEventListener("click", () => {
  const active = austragenBtn.getAttribute("aria-pressed") === "true";
  checkoutTime = active ? null : new Date();
  austragenBtn.setAttribute("aria-pressed", String(!active));
  render();
});

copyBtn.addEventListener("click", async () => {
  let label = "Kopiert!";
  try {
    await navigator.clipboard.writeText(output.textContent);
  } catch (err) {
    label = "Kopieren fehlgeschlagen";
  }

  clearTimeout(copyBtnTimer);
  copyBtn.textContent = label;
  copyBtnTimer = setTimeout(() => {
    copyBtn.textContent = "Text kopieren";
  }, 2000);
});

loadSaved();
render();
