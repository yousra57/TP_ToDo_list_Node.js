"use strict";
// Adapter uniquement ces valeurs aux routes et noms de colonnes de VOTRE API.
const API_URL = "/tasks";
const SOCKET_PATH = "/";
const taskList = document.getElementById("tasks");
const message = document.getElementById("message");
const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const filter = document.getElementById("filter");
const connection = document.getElementById("connection");

const idsAffiches = new Set();
let premierAffichage = true;
let dernierRendu = '';

function jouerAnimation(element, ...classes) { // Une animation ne se rejoue que si sa classe est retirée puis remise. Cette fonction s’en charge
  element.classList.add(...classes);
  element.addEventListener("animationend", () => {
    element.classList.remove(...classes);
  }, { once: true });
}



let tasks = [];
function normalizeTask(t) {
  return {
    id: t.id,
    title: t.title ?? t.titre ?? "",
    done: Boolean(
      t.done ?? t.completed ?? t.status === "done" ?? t.etat === "fini",
    ),
  };
}


async function request(path = "", options = {}) {
  const response = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok)
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  if (response.status === 204) return null;
  return response.json();
}


async function loadTasks() {
  try {
    const payload = await request();
    // Certaines API répondent { tasks: [...] } ou { data: [...] } plutôt qu'un tableau.
    const data = Array.isArray(payload)
      ? payload
      : (payload.tasks ?? payload.data ?? []);
    if (!Array.isArray(data))
      throw new Error("Réponse API inattendue : tableau attendu");
    tasks = data.map(normalizeTask);
    render();
    message.textContent = "";
  } catch (err) {
    message.textContent = `Impossible de charger les tâches : ${err.message}`;
  }
}

// ---------------------- RENDER ------------
function render() {
  const signature = JSON.stringify([filter.value, tasks]);
  if (signature === dernierRendu) return;
  dernierRendu = signature;

  taskList.replaceChildren();
  const shown = tasks.filter(
    (t) =>
      filter.value === "all" || (filter.value === "done" ? t.done : !t.done),
  );
  document.getElementById("empty").hidden = shown.length !== 0;
  tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'card';

    // animation qui s'applique pour la nouvelle tâche 
    if (!idsAffiches.has(task.id)) { // si l'id n'existe pas = tâche nouvelle => on applique l'animation pour la nvl tâche
      li.classList.add("is-new");
      li.style.setProperty("--i", premierAffichage ? index : 0);
    }


    if (task.done) li.classList.add('done');

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // RECTO : titre + statut
    const front = document.createElement('div');
    front.className = 'face front';
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = task.title;          // toujours textContent, jamais innerHTML
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = task.done ? 'Terminée' : 'À faire';
    front.append(title, badge);

    // VERSO : actions
    const back = document.createElement('div');
    back.className = 'face back';
    const label = document.createElement('label');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = task.done;
    check.setAttribute('aria-label', `Terminer ${task.title}`);
    check.addEventListener('change', () => updateTask(task, check.checked));
    label.append(check, ' Terminée');
    const del = document.createElement('button');
    del.textContent = 'Supprimer';
    del.className = 'delete';
    // ---------- Supprimez une tâche animée: elle s’efface, puis la liste se met à jour ----------
    del.addEventListener('click', () => { 
      li.classList.add("is-leaving");
      li.addEventListener("animationend", (event) => {
        if (event.animationName !== "card-out") return;
        deleteTask(task.id);
      });
    });

    back.append(label, del);

    inner.append(front, back);
    li.append(inner);
    taskList.append(li);
  });
  // Enregistrement de la tâche nouvelle et changement
  idsAffiches.clear();
  tasks.forEach(tache => idsAffiches.add(tache.id));
  premierAffichage = false;

  // Étape 4 : compteur du menu
  const compteur = document.querySelector("#compteur");
  if (compteur.textContent !== String(tasks.length)) {
    compteur.textContent = tasks.length;
    jouerAnimation(compteur,
      "animate__animated", "animate__heartBeat");
  }

}


// --------------------------------------------------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  // 
  if (titleInput.value.trim() === "") {
  jouerAnimation(titleInput, "shake");
  titleInput.focus();
  return;
}
  const title = titleInput.value.trim();
  if (title.length < 2) return;
  try {
    await request("", { method: "POST", body: JSON.stringify({ title }) });
    titleInput.value = "";
    await loadTasks();
  } catch (err) {
    message.textContent = `Ajout impossible : ${err.message}`;
  }
});



// --------------------------------------------
async function updateTask(task, done) {
  try {
    await request("/" + encodeURIComponent(task.id), {
      method: "PUT",
      body: JSON.stringify({ title: task.title, done }),
    });
    await loadTasks();
  } catch (err) {
    message.textContent = `Modification impossible : ${err.message}`;
    await loadTasks();
  }
}


async function deleteTask(id) {
  try {
    await request("/" + encodeURIComponent(id), { method: "DELETE" });
    await loadTasks();
  } catch (err) {
    message.textContent = `Suppression impossible : ${err.message}`;
  }
}


filter.addEventListener("change", render);
document.getElementById("refresh").addEventListener("click", loadTasks);


function connectWebSocket() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${location.host}${SOCKET_PATH}`);
  socket.addEventListener("open", () => {
    connection.textContent = "● Temps réel connecté";
    connection.style.background = "#dbf6e5";
  });
  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === "tasks:changed") loadTasks();
    } catch (err) {
      console.warn("Message WebSocket ignoré", err);
    }
  });
  socket.addEventListener("close", () => {
    connection.textContent = "● Déconnecté — reconnexion…";
    connection.style.background = "#fff3d9";
    setTimeout(connectWebSocket, 2000);
  });
  socket.addEventListener("error", () => {
    connection.textContent = "● Erreur WebSocket";
  });
}

loadTasks();
connectWebSocket();
