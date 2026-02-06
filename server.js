const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const sqlite3 = require("sqlite3").verbose();

const dbName = "tasks.db";

const port = 3000;

const db = new sqlite3.Database(dbName);

app.use(bodyParser.json());

const checkExist = (task, res) => {
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
};

const serverError = (err, res) => {
  if (err) {
    return res.status(500).json({ error: err.message });
  }
};

app.get("/", (req, res) => {
  return res.send("Hello, express!");
});

app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    serverError(err, res);

    return res.status(200).json(rows);
  });
});

app.post("/tasks", (req, res) => {
  const newTask = req.body;
  db.run("INSERT INTO tasks (text) VALUES (?)", [newTask.text], (err) => {
    serverError(err, res);

    return res.status(201).json({ id: this.lastID });
  });
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  db.get("SELECT * FROM tasks WHERE id = ?", taskId, (err, row) => {
    serverError(err, res);
    checkExist(row, res);
    return res.status(200).json(row);
  });
});

app.put("/tasks/:id", (req, res) => {
  const { text } = req.body;
  const taskId = parseInt(req.params.id);

  db.run("UPDATE tasks SET text = ? WHERE id = ?", [text, taskId], (err) => {
    serverError(err, res);

    return res.status(200).json({ id: taskId, text });
  });
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  db.run("DELETE FROM tasks WHERE id = ?", taskId, (err) => {
    serverError(err, res);
    return res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`server listening http://localhost:${port}`);
});
