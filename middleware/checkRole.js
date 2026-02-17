export const checkRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).send({ message: "User not Found" });
    }

    if (req.user.role !== "admin") {
      return res.status(500).json({
        message: "User don't have pewmissions",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};