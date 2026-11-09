// Démarrage et configuration Express

// constantes
const express = require("express");
const app = express();
const PORT = 3000;
const tasksRouter = require("./routes/tasks.routes");

app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "API ToDo opérationnelle" });
});


app.use("/tasks", tasksRouter);


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});