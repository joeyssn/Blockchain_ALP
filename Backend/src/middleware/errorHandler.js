export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (
    error.message?.includes("required") ||
    error.message?.includes("Shoe") ||
    error.message?.includes("wallet")
  ) {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}
