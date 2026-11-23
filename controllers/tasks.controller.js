// Validation + réponses HTTP


// ON DEFINIT LES CONTROLLERS : lire toutes les tâches
const {signalerChangementTaches} = require("../tempsReel"); // import le module websocket pour signaler les changements aux clients
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
        return res.status(400).json({
            error: "ID invalide"
        });
    }

    try {
        const task = await repo.getTaskById(id);

        if (!task) {
            return res.status(404).json({
                error: "Tâche non trouvée"
            });
        }

        res.json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erreur de lecture"
        });
    }
}



async function createTask(req, res) {
    const { title } = req.body || {};

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "Titre obligatoire"
        });
    }

    try {
        const task = await repo.createTask(title.trim());
        signalerChangementTaches(); // Signale aux clients connectés que les tâches ont changé
        res.status(201).json(task);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erreur de sauvegarde"
        });
    }
}


async function updateTask(req, res) {
    const id = Number(req.params.id);
    const { title, done } = req.body || {};

    if (
        !Number.isInteger(id) || id < 1 ||
        typeof title !== "string" || !title.trim() ||
        typeof done !== "boolean"
    ) {
        return res.status(400).json({
            error: "Données invalides"
        });
    }

    try {
        const task = await repo.updateTask(
            id,
            title.trim(),
            done
        );

        if (!task) {
            return res.status(404).json({
                error: "Tâche introuvable"
            });
        }
        signalerChangementTaches(); 
        res.json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erreur de modification"
        });
    }
}


async function patchTask(req, res) {
    const id = Number(req.params.id);
    const { done } = req.body || {};

    if (
        !Number.isInteger(id) || id < 1 ||
        typeof done !== "boolean"
    ) {
        return res.status(400).json({
            error: "Données invalides"
        });
    }

    try {
        const task = await repo.patchTask(id, done);

        if (!task) {
            return res.status(404).json({
                error: "Tâche introuvable"
            });
        }
        signalerChangementTaches(); 
        res.json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erreur de modification"
        });
    }
}



async function deleteTask(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            error: "ID invalide"
        });
    }

    try {
        const deleted = await repo.deleteTask(id);

        if (!deleted) {
            return res.status(404).json({
                error: "Tâche introuvable"
            });
        }
        signalerChangementTaches(); 
        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Erreur de suppression"
        });
    }
}



module.exports = { listTasks, getTask, createTask, updateTask, patchTask, deleteTask };
