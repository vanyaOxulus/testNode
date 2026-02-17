import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    require: [true, "This is Required"],
  },
  lastName: {
    type: String,
    require: [true, "This is Required"],
  },
  email: {
    type: String,
    require: [true, "This is Required"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "This is Required"],
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    type: String,
    default: null,
  },
});

export const User = mongoose.model("User", userSchema);
