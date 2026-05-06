export const asyncHandler = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      if (e.name === "ValidationError") {
        res.status(400).json({ message: e.message });
      } else if (e.name === "CastError") {
        res.status(404).json({ message: "Cannot find given id." });
      } else {
        res.status(500).json({ message: e.message });
      }
    }
  };
};
