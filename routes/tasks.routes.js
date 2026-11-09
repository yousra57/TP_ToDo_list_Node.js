// URL + méthode HTTP


//ON DEFINIT LES ROUTES POUR LES TACHES
// On appelle express et le router et on importe le controller (les "using" de C#)
const express = require("express");
const router = express.Router();
const controller = require("../controllers/tasks.controller");

// Les routes du CRUD
router.get("/", controller.listTasks);
router.get("/:id", controller.getTask);
router.post("/", controller.createTask);
router.put("/:id", controller.updateTask);
router.patch("/:id", controller.patchTask);
router.delete("/:id", controller.deleteTask);


module.exports = router;