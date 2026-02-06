const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Task description is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

module.exports = {
  Task,
};
