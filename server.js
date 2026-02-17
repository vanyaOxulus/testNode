import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";

// Імпорт моделей та middleware
import { Task } from "./models/task2Model.js";
import { User } from "./models/userModel.js";
import {checkRole} from "./middleware/checkRole.js";
import JWTAuth from "./middleware/JWTAuth.js";

const app = express();
connectDB();
const port = 3000;

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage, limits: { fileSize: 1000000 } });

app.get("/", (req, res) => {
  return res.send("Hello, express!");
});

app.put("/photo/:id", upload.single("demo_image"), async (req, res) => {
  try {
    const doc = await User.findByIdAndUpdate(
      req.params.id,
      {
        photo: req.file.filename,
      },
      { new: true },
    );

    return res.status(201).json(doc);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password: pass,
      role,
      photo,
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      role,
      photo,
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
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
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
