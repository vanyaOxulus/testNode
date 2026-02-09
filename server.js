const express = require("express");

const connectDB = require("./config/db");
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
app.use(bodyParser.json());

const { Task } = require("./models/task2Model");
const User = require("./models/userModel");
const checkAuth = require("./middleware/checkAuth");
const checkRole = require("./middleware/checkRole");
const JWTAuth = require("./middleware/JWTAuth");

connectDB();

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password: pass, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      role,
    });

    const { password, ...userData } = user._doc;

    return res.status(201).json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password: pass } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    const isValid = await bcrypt.compare(pass, user.password);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid password or email",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload
      process.env.JWT_SECRET, // secret
      { expiresIn: "1h" }, // час життя
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  return res.send("Hello, express!");
});

app.get("/tasks", JWTAuth, async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.status(200).json(tasks);
  } catch (e) {
    console.error("Task find error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.post("/tasks", JWTAuth, async (req, res) => {
  try {
    const newTask = req.body;
    const task = await Task.create({
      text: newTask.text,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(201).json(task);
  } catch (e) {
    console.error("Task creation error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (e) {
    console.error("Task find error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.put("/tasks/:id", JWTAuth, checkRole, async (req, res) => {
  try {
    const { text, isCompleted } = req.body;
    const taskId = req.params.id;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { text, isCompleted },
      { new: true },
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (e) {
    console.error("Task Edit error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.delete("/tasks/:id", JWTAuth, checkRole, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(204).send();
  } catch (e) {
    console.error("Task Delete error: ", e);
    return res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`server listening http://localhost:${port}`);
});
