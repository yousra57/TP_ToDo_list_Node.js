// Validation + réponses HTTP


// ON DEFINIT LES CONTROLLERS : lire toutes les tâches
const repo = require("../repositories/tasks.repository");   // import le repository : du module de lecture/écriture des tâches 

async function listTasks(req, res) {
    try {
        const tasks = await repo.readTasks();
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de lecture" });
    }
}


async function getTask(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }
    try {
        const tasks = await repo.readTasks();
        const task = tasks.find((item) => item.id === id);
        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de lecture" });
    }
}


async function createTask(req, res) {
    const { title } = req.body || {};
    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Titre obligatoire" });
    }
    try {
        const tasks = await repo.readTasks();
        const nextId = Math.max(0, ...tasks.map(t => t.id)) + 1;
        const task = { id: nextId, title: title.trim(), done: false };
        tasks.push(task);
        await repo.writeTasks(tasks);
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de sauvegarde" });
    }
}

async function updateTask(req, res) {
    const id = Number(req.params.id);
    const { title, done } = req.body || {};
    if (!Number.isInteger(id) || id < 1 ||
            typeof title !== "string" || !title.trim() ||
            typeof done !== "boolean") {
        return res.status(400).json({ error: "Données invalides" });
    }
    try {
        const tasks = await repo.readTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) {
            return res.status(404).json({ error: "Tâche introuvable" });
        }
        task.title = title.trim();
        task.done = done;
        await repo.writeTasks(tasks);
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de sauvegarde" });
    }
}

async function patchTask(req, res) {
    const id = Number(req.params.id);
    const { done } = req.body || {};
    if (!Number.isInteger(id) || id < 1 ||
            typeof done !== "boolean") {
        return res.status(400).json({ error: "done doit être booléen" });
    }
    try {
        const tasks = await repo.readTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) {
            return res.status(404).json({ error: "Tâche introuvable" });
        }
        task.done = done;
        await repo.writeTasks(tasks);
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de sauvegarde" });
    }
}


async function deleteTask(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }
    try {
        const tasks = await repo.readTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Tâche introuvable" });
        }
        tasks.splice(index, 1);
        await repo.writeTasks(tasks);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de sauvegarde" });
    }
}


module.exports = { listTasks, getTask, createTask, updateTask, patchTask, deleteTask };

