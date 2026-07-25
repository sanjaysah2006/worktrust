export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkTrust API running",
    version: "1.0.0",
  });
};