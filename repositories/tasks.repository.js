// Lecture/écriture des tâches
// Ce module est le seul qui connaît le chemin du fichier de données


// On créer le repository asynchrone pour lire et écrire les tâches dans le fichier JSON
const fs = require("node:fs/promises");
const path = require("node:path");

const FILE = path.join(__dirname, "..", "data", "tasks.json");

async function readTasks() {
const content = await fs.readFile(FILE, "utf8");
return JSON.parse(content);
}


async function writeTasks(tasks) {
const json = JSON.stringify(tasks, null, 2);
await fs.writeFile(FILE, json, "utf8");
}


module.exports = { readTasks, writeTasks };