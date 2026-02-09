const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic") === -1
  ) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  const base64Credentials = req.headers.authorization.split(" ")[1];

  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii",
  );

  const [email, password] = credentials.split(":");

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not Found",
    });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(400).json({
      message: "Invalid password or email",
    });
  }

  req.user = user._doc;

  next();
};
